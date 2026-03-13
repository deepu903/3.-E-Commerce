import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api/api';
import { StateService } from '../../../core/services/state/state';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm implements OnInit{
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private stateService = inject(StateService);

  productForm!: FormGroup;
  isEditMode = false;
  productId?: number;
  isLoading = false;

  get f() { return this.productForm.controls; }

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void{
    this.productForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      brand: [''],
      category: ['', Validators.required],
      discountPercentage: [0]
    });
  }

  checkEditMode(): void{
    const id = this.route.snapshot.paramMap.get('id');
    if(id) {
      this.isEditMode = true;
      this.productId = +id;
      this.loadProduct();
    }
  }

  loadProduct(): void {
    this.apiService.getProductById(this.productId!).subscribe({
      next: (product) => {
        this.productForm.patchValue(product);
      },
      error: (err) => {
        console.clear();
        console.error(err);
      }
    });
  }

  onSubmit(): void{
    if(this.productForm.invalid) return;

    this.isLoading = true;
    const formData = this.productForm.value;

    const request = this.isEditMode ? this.apiService.updateProduct(this.productId!, formData) : this.apiService.createProduct(formData);
    
    request.subscribe({
      next: (response) => {
        this.stateService.addNotification('success', `Product ${this.isEditMode ? 'updated' : 'created'} successfully!`);
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.clear();
        console.error(err);
        this.isLoading = false;
        this.stateService.addNotification('error', 'Operation failed!');
      }
    });
  }

  onCancel(): void{
    this.router.navigate(['/products'])
  }
}
