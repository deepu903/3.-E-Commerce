import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective implements OnInit{

  /**
   * @INPUT PROPERTIES - Allow customization from parent component.
   */

  // Color to highlight on the hover (default: 'yellow')
  @Input() highlightColor: string = 'yellow';

  // Default color when not hovering (default: 'transparent')
  @Input() defaultColor: string = 'transparent';

  // Duration of color transition in ms
  @Input () transitionDuration: number = 300;

  /**
   * CONSTRUCTOR - Dependency Injection
   * @param el - Reference to the DOM element
   * @param renderer - Safe way to modify the DOM
   */
  constructor(private el: ElementRef, private renderer: Renderer2) { }

    /**
     * ngOnInit - Lifecycle hook: Called after the directive is initialized. Set initial background color here
     */
    ngOnInit(): void {
      // Set initial background color
      this.setBackgroundColor(this.defaultColor);

      // Add smooth transition
      this.renderer.setStyle(this.el.nativeElement, 'transition', `background-color ${this.transitionDuration}ms ease-in-out`);

      // Add cursor pointer for better UX
      this.renderer.setStyle(this.el.nativeElement, 'cursor', 'pointer');

      console.log('✨ Highlight directive initialized');
    }

    /**
     * @HostListener - Listen to DOM events: Decorates methods to handle events on host element.
     * SYNTAX: @HostListener('eventName', ['$event'])
     */

    // MOUSE ENTER EVENT:- Triggered when mouse enters the element
    @HostListener('mouseenter') onMouseEnter() {
      this.setBackgroundColor(this.highlightColor);
      console.log(`🎨 Highlighted: ${this.highlightColor}`);
    }

    // MOUSE LEAVE EVENT:- Triggered when mouse leaves the element
    @HostListener('mouseleave') onMouseLeave() {
      this.setBackgroundColor(this.defaultColor);
      console.log('🎨 Highlight removed');
    }

    // CLICK EVENT (Bonus Feature):- Log when element is clicked
    @HostListener('click', ['$event']) onClick(event: MouseEvent): void {
      console.log('📄 Highlighted element clicked!', event);

      // Add ripple effect on click
      this.addRippleEffect();
    }

    // DOUBLE CLICK EVENT :- Toggle permanent highlight on double-click
    @HostListener('dblclick') onDoubleClick(): void {
      const currentBg = this.el.nativeElement.style.backgroundColor;
      const isPermament = currentBg === this.highlightColor;

      if(isPermament) {
        this.setBackgroundColor(this.defaultColor);
        console.log('🔓 Permament highlighted removed');
      } else {
        this.setBackgroundColor(this.highlightColor);
        console.log('🔒 Permament highlight applied');
      }
    }

    // HELPER METHODS:- Set Background Color
    // Uses Renderer2 for safe DOM manipulation
    private setBackgroundColor(color: string) {
      this.renderer.setStyle(this.el.nativeElement, 'backgorundColor', color);
    }

    // BONUS: ADD Ripple effect on click:- Creates a ripple animation
    private addRippleEffect(): void {
      const element = this.el.nativeElement;

      // Create ripple element
      const ripple = this.renderer.createElement('span');
      this.renderer.addClass(ripple, 'ripple');
      this.renderer.setStyle(ripple, 'position', 'absolute');
      this.renderer.setStyle(ripple, 'borderRadius', '50%');
      this.renderer.setStyle(ripple, 'backgroundColor', 'rgba(255,255,255,0.6)');
      this.renderer.setStyle(ripple, 'width', '20px');
      this.renderer.setStyle(ripple, 'height', '20px');
      this.renderer.setStyle(ripple, 'animation', 'ripple 0.6s ease-out');

      // Make parent position reraltive for absolute positioning
      this.renderer.setStyle(element, 'position', 'relative');
      this.renderer.setStyle(element, 'overflow', 'hidden');

      // Append ripple to parent element
      this.renderer.appendChild(element, ripple);

      // Remove ripple after animation
      setTimeout(() => {
        this.renderer.removeChild(element, ripple);
      }, 600);
    }






}
