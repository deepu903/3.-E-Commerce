import { Component, signal } from '@angular/core';
import { Navbar } from "./shared/components/navbar/navbar";
import { RouterOutlet } from "@angular/router";
import { Footer } from "./shared/components/footer/footer";
import { Loader } from "./shared/components/loader/loader";


@Component({
  selector: 'app-root',
  imports: [Navbar, RouterOutlet, Footer, Loader],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('e-commerce');
}
