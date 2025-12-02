import { Routes } from '@angular/router';
import { loginGuard } from './guards/login-guard';
import { authGuard } from './guards/auth-guard';
import { Chat } from './chat/chat';

export const routes: Routes = [
    { path:"register" , loadComponent:()=> import("./register/register").then(x=> x.Register) ,canActivate:[loginGuard]},
    { path:"login" , loadComponent:()=> import("./login/login").then(x=> x.Login) ,canActivate:[loginGuard]},
    {path:"chat",component: Chat,canActivate:[authGuard]},
    { path:"**",redirectTo:"chat",pathMatch:"full"}
];
