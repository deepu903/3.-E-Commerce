import { Component, inject } from '@angular/core';
import { StateService } from '../../../core/services/state/state';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

@Component({
  selector: 'app-loader',
  imports: [MatProgressSpinnerModule],
  templateUrl: './loader.html',
  styleUrl: './loader.css',
})
export class Loader {
  // Inject stateService
  private stateService = inject(StateService);

  isLoading = this.stateService.isLoading;
}
