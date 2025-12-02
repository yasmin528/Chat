using API.Common;
using API.DTOs;
using API.Extensions;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.EndPoints
{
    public static class AccountEndPoint
    {
        public static RouteGroupBuilder MapAccountEndPoint(this WebApplication app)
        {
            var group = app.MapGroup("api/account").WithTags("account");
            group.MapPost("/register", async (HttpContext context,
                        UserManager<AppUser> userManager,
                        [FromForm] string fullName,
                        [FromForm] string email,
                        [FromForm] string password, [FromForm] string userName, [FromForm] IFormFile? profileImage, TokenService tokenService) =>
                {

                    var userFromDb = await userManager.FindByEmailAsync(email);

                    if (userFromDb != null)
                    {
                        return Results.BadRequest(Response<string>.Failure("user is already exist"));
                    }

                    if (profileImage is null)
                    {
                        return Results.BadRequest(Response<string>.Failure("Profile Image is Required"));
                    }

                    var picture = await FileUpload.Upload(profileImage);

                    picture = $"{context.Request.Scheme}://{context.Request.Host}/uploads/{picture}";

                    var user = new AppUser
                    {
                        Email = email,
                        FullName = fullName,
                        UserName = userName,
                        ProfileImage = picture
                    };

                    var result = await userManager.CreateAsync(user, password);
                    if (!result.Succeeded)
                    {
                        return Results.BadRequest(Response<string>.Failure(result.Errors.Select(x => x.Description).FirstOrDefault()!));
                    }
                    var registeredUser = await userManager.FindByEmailAsync(email);
                    var token = tokenService.GenerateToken(registeredUser.Id, registeredUser.UserName!);


                    return Results.Ok(Response<string>.Success(token, "User Created Successfully"));
                }).DisableAntiforgery();


            group.MapPost("/login", async (UserManager<AppUser> userManager, TokenService tokenService, LoginDto dto) =>
            {
                if (dto == null)
                {
                    return Results.BadRequest(Response<string>.Failure("Invalid login details"));
                }

                var user = await userManager.FindByEmailAsync(dto.Email);

                if (user == null)
                {
                    return Results.BadRequest(Response<string>.Failure("user not found"));
                }

                var result = await userManager.CheckPasswordAsync(user, dto.password);

                if (!result)
                {
                    return Results.BadRequest(Response<string>.Failure("invalid email or password"));
                }

                var token = tokenService.GenerateToken(user.Id, user.UserName!);

                return Results.Ok(Response<string>.Success(token, "Login Successfully"));
            });

            group.MapGet("/me", async (HttpContext context, UserManager<AppUser> userManager) =>
                                {
                                    var currentLoggedInUserId = context.User.GetUserId();
                                    var currentLoggedInUserName = await userManager.Users.SingleOrDefaultAsync(x => x.Id == currentLoggedInUserId.ToString());
                                    return Results.Ok(Response<AppUser>.Success(currentLoggedInUserName!, "User Fetched successfully"));
                                }).RequireAuthorization();
            return group;
        }
    }
}
