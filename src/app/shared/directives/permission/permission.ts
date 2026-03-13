import { Directive, Input, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth';
@Directive({
  selector: '[appPermission]'
})
export class PermissionDirective implements OnInit{

  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  @Input() set appPermission(requiredPermission: string) {
    console.log(`🔐 Permission Directive: Checking "${requiredPermission}"`);

    // Check if user has the required permission
    this.updateView(requiredPermission);
  }

  // LIFECYCLE HOOK - ngOnInit
  ngOnInit(): void {
    console.log('🔐 Permission Directive initialized')
  }

  // UPDATE VIEW - Show or Hide Content
  private updateView(requiredPermission: string): void {
    // Get current user from AuthService (using Signal)
    const currentUser = this.authService.currentUser();

    // permission check logic
    let hasPermission = false;
    if(!currentUser) {
      // No user logged in
      hasPermission = false;
      console.log('❌ No user logged in');
    } else if(currentUser.role === 'admin') {
      // Admin has all permissions
      hasPermission = true;
      console.log('✅ User is admin - Access granted');
    } else if(currentUser.permissions?.includes(requiredPermission)) {
      // User has specific permission
      hasPermission = true;
      console.log(`✅ User has "${requiredPermission}" permission`);
    } else {
      // User doesn't have permission
      hasPermission = false;
      console.log(`❌ User lacks "${requiredPermission} permission`);
    }

    // RENDER OR CLEAR TEMPLATE
    if(hasPermission) {
      // SHOW: Create view from template
      this.viewContainer.clear(); // Clear first to avoid duplicates
      this.viewContainer.createEmbeddedView(this.templateRef);
      console.log('👁️ content rendered');
    } else {
      // HIDE: Clear the view
      this.viewContainer.clear();
      console.log('🚫 Content Hidden');
    }
  }
}
