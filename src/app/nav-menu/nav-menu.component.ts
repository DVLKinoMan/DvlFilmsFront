import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit, OnDestroy {
  isExpanded = false;
  isAuthenticated = false;
  userName: string;
  profilePicture: string;
  private userSub: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router) {

  }
  ngOnInit() {
    this.userSub = this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
      if (user) {
        this.userName = user.userName;
        this.profilePicture = user.photo;
      }
    });
  }

  loginClicked() {
    this.router.navigate(["/login"], {
      queryParams: {
        registerMode: false,
        returnUrl: this.router.url
      }
    })
  }

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }
}
