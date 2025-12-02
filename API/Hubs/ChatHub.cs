using API.Data;
using API.DTOs;
using API.Extensions;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;

namespace API.Hubs
{
    [Authorize]
    public class ChatHub(UserManager<AppUser> userManager, AppDbContext context,ILogger<ChatHub> logger) : Hub
    {
        public static readonly ConcurrentDictionary<string, OnlineUserDto> onlineUsers = new();

        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var receiverId = httpContext?.Request.Query["senderId"].ToString();
            var username = Context.User!.Identity!.Name;
            var currentUser = await userManager.FindByNameAsync(username!);
            var connectionId = Context.ConnectionId;

            if (onlineUsers.ContainsKey(username!))
            {
                onlineUsers[username!].ConnectionId = connectionId;
            }
            else
            {
                var user = new OnlineUserDto
                {
                    ConnectionId = connectionId,
                    UserName = username,
                    ProfilePicture = currentUser!.ProfileImage,
                    FullName = currentUser!.FullName
                };
                onlineUsers.TryAdd(username!, user);
                await Clients.AllExcept(connectionId).SendAsync("Notify", currentUser);
            }
            if (!string.IsNullOrEmpty(receiverId))
            {
                await LoadMessages(receiverId);
            }
            await Clients.All.SendAsync("OnlineUsers", await GetAllUsers());
        }

        public async Task SendMessage(MessageRequestDto message)
        {
            var senderId = Context.User!.Identity!.Name;
            var receiverId = message.ReceiverId;
            var newMsg = new Message
            {
                Sender = await userManager.FindByNameAsync(senderId!),
                Receiver = await userManager.FindByIdAsync(receiverId!),
                Content = message.Content,
                IsRead = false,
                CreatedDate = DateTime.UtcNow
            };
            context.Messages.Add(newMsg);
            await context.SaveChangesAsync();
            await Clients.User(receiverId!).SendAsync("ReceiveNewMessage", newMsg);
        }

        public async Task LoadMessages(string RecipientId, int pageNumber = 1)
        {
            int pageSize = 10;
            var userName = Context.User!.Identity!.Name;
            var currentUser = await userManager.FindByNameAsync(userName!);

            if (currentUser == null)
            {
                return;
            }

            List<MessageResponseDto> messages = await context.Messages
                .Where(x => (x.ReceiverId == currentUser.Id && x.SenderId == RecipientId) ||
                    (x.SenderId == currentUser.Id && x.ReceiverId == RecipientId))
                .OrderByDescending(x => x.CreatedDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new MessageResponseDto
                {
                    Id = x.Id,
                    SenderId = x.SenderId,
                    ReceiverId = x.ReceiverId,
                    CreatedDate = x.CreatedDate,
                    Content = x.Content
                }).ToListAsync();
            messages.Reverse();

            foreach (var message in messages)
            {
                logger.LogInformation("Message ID: {Id}, Sender: {Sender}, Receiver: {Receiver}, Content: {Content}, Created: {Created}",
                message.Id, message.SenderId, message.ReceiverId, message.Content, message.CreatedDate);

                var msg = await context.Messages.FirstOrDefaultAsync(x => x.Id == message.Id);
                if (msg != null && msg.SenderId == currentUser.Id)
                {
                    msg.IsRead = true;
                    await context.SaveChangesAsync();
                }
            }
            await Clients.User(currentUser.Id).SendAsync("ReceiveMessageList", messages);
        }

        public async Task NotifyTyping(string RecipientName)
        {
            var senderUserName = Context.User!.Identity!.Name;
            if (senderUserName == null)
            {
                return;
            }
            var connectionId = onlineUsers.Values.FirstOrDefault(x => x.UserName == RecipientName)?.ConnectionId;

            if (connectionId != null)
            {
                await Clients.Client(connectionId).SendAsync("NotifyTypingToUser", senderUserName);
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userName = Context.User!.Identity!.Name;
            onlineUsers.TryRemove(userName!, out _);
            await Clients.All.SendAsync("OnlineUsers", await GetAllUsers());
        }

        private async Task<IEnumerable<OnlineUserDto>> GetAllUsers()
        {
            var username = Context.User!.GetUserName();
            var onlineUsersSet = new HashSet<string>(onlineUsers.Keys);
            var users = await userManager.Users.Select(u => new OnlineUserDto
            {
                Id = u.Id,
                UserName = u.UserName,
                FullName = u.FullName,
                ProfilePicture = u.ProfileImage,
                IsOnline = onlineUsersSet.Contains(u.UserName!),
                UnreadCount = context.Messages.Count(x => x.ReceiverId == username && x.SenderId == u.Id && !x.IsRead)
            }).OrderByDescending(u => u.IsOnline).ToListAsync(); ;

            return users;
        }
    }
}
