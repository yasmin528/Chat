import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../services/auth-service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatError} from '@angular/material/form-field';

import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/api.response';
import { Router ,RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule ,MatFormFieldModule,MatInputModule,FormsModule,MatButtonModule,MatIconModule,ReactiveFormsModule, MatError,RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  userName!:string;
  email!:string;
  password!:string;
  fullName!:string;
  profilePicture:string = 'https://randomuser.me/api/portraits/lego/5.jpg';
  profileImage!:File;

  fb = inject(FormBuilder);
  authService = inject(AuthService);
  hide = signal(true);
  snackBar = inject(MatSnackBar);
  router = inject(Router);

  registerForm = this.fb.group({
    userName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    fullName: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  togglePassword($event: MouseEvent) {
    console.log(this.hide())
    this.hide.set(!this.hide());
  }
  onFileSelected(event: any) {
    const file:File = event?.target.files[0];
    if(file){
      this.profileImage = file;

      const reader = new FileReader();
      reader.onload = (e) =>{
        this.profilePicture = e.target?.result as string;
        console.log(this.profilePicture);
      }
      reader.readAsDataURL(file);
      console.log(this.profilePicture);
    }
  }

  submit() {
    let formData = new FormData();
    formData.append("email", this.registerForm.value.email ?? '');
    formData.append("userName", this.registerForm.value.userName ?? '');
    formData.append("fullName", this.registerForm.value.fullName ?? '');
    formData.append("password", this.registerForm.value.password ?? '');
    if (this.profileImage) {
      formData.append("profileImage", this.profileImage);
    }

    this.authService.register(formData).subscribe({
      next:()=>{
        this.snackBar.open("User Registered Successfully","close",{duration: 3000});
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
