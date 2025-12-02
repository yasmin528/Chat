import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatError} from '@angular/material/form-field';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/api.response';
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';
import { RouterLink } from "@angular/router";
@Component({
  encapsulation: ViewEncapsulation.None ,
  selector: 'app-login',
  imports: [CommonModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatIconModule, ReactiveFormsModule, MatError, RouterLink,MatSnackBarModule ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email!:string;
  password!:string;

  fb = inject(FormBuilder);
  authService = inject(AuthService);
  hide = signal(true);
  snackBar = inject(MatSnackBar);
  router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });


  togglePassword($event: MouseEvent) {
    console.log(this.hide())
    this.hide.set(!this.hide());
  }

  submit() {
    let email = this.loginForm.value.email ?? '';
    let password = this.loginForm.value.password ?? '';
    this.authService.login(email,password).subscribe({
      next:()=>{
        this.snackBar.open("Logged Successfully", "Close", {
          duration: 300000
        });

        this.authService.me().subscribe({
          next: () => {
            this.router.navigate(["/"]); 
          }
        });
      },
      error:(error:HttpErrorResponse)=>{
        let err = error.error as ApiResponse<string>;
        this.snackBar.open(err.error,"close",{duration: 3000});
      }
    })
  }
}
