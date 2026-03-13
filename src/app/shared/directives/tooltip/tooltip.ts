import { Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements OnDestroy{

  // Tooltip text content
  @Input() appTooltip: string = '';

  // Tooltip position
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

  // Show delay in milliseconds
  @Input() tooltipDelay: number = 300;

  // Reference to created tooltip element
  private tooltip: HTMLElement | null = null;

  // Timeout for delayed tooltip element
  private showTimeout: any;

 constructor(private el: ElementRef, private renderer: Renderer2) { }

 @HostListener('mouseenter') onMouseEnter(): void {
  // Don't show if no tooltip text
  if(!this.appTooltip) return;

  // Delay showing tooltip for better UX
  this.showTimeout = setTimeout(() => {
    this.createTooltip();
  }, this.tooltipDelay);
 }

 @HostListener('mouseleave') onMouseLeave(): void {
  // Clear timeout if user leaves before tooltip shows
  if(this.showTimeout) {
    clearTimeout(this.showTimeout);
  }

  // Remove tooltip
  this.destroyTooltip();
 }

 // Create Tooltip Element 
 private createTooltip(): void {
  // Don't create if already exists
  if(this.tooltip) return;
  
  // STEP - 1: Create the tooltip element
  this.tooltip = this.renderer.createElement('div');

  // STEP - 2: Create text node with tooltip content
  const text = this.renderer.createText(this.appTooltip);
  this.renderer.appendChild(this.tooltip, text);

  // STEP - 3: Add Tailwind CSS classes for styling
  const classes = [
    'absolute',
    'z-50',
    'px-3',
    'py-2',
    'text-sm',
    'text-white',
    'bg-gray-800',
    'rounded-lg',
    'shadow-lg',
    'whitespace-nowrap',
    'animate-fade-in',
    'pointer-events-none',
    'transition-opacity',
    'duration-300',
  ];

  classes.forEach(className => {
    this.renderer.addClass(this.tooltip!, className);
  });

  // STEP - 4: Add arrow/pointer to tooltip
  const arrow = this.renderer.createElement('div');
  this.renderer.addClass(arrow, 'tooltip-arrow');
  this.renderer.appendChild(this.tooltip, arrow);

  // Arrow styling based on position
  this.styleArrow(arrow);
  
  // STEP - 5: Append tooltip to body
  this.renderer.appendChild(document.body, this.tooltip);

  // STEP - 6: Position tooltip relative to host element
  this.positionTooltip();

  console.log('💬 Tooltip created:', this.appTooltip);
 }

 /** POSITION TOOLTIP */
 private positionTooltip(): void {
  if(!this.tooltip) return;

  // Get host element position
  const hostPos = this.el.nativeElement.getBoundingClientRect();

  // Get tooltip dimensions
  const tooltipPos = this.tooltip.getBoundingClientRect();

  // Calculate position based on tooltipPosition input
  let top: number;
  let left: number;

  const spacing = 10; // Gap spacing element and tooltip
  
  switch (this.tooltipPosition) {
    case 'top':
      top = hostPos.top - tooltipPos.height - spacing;
      left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
      break;

    case 'bottom':
      top = hostPos.bottom + spacing;
      left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
      break;
    
    case 'left':
      top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
      left = hostPos.left - tooltipPos.width - spacing;
      break;

    case 'right':
      top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
      left = hostPos.right + spacing;
      break;
    
    default:
      top = hostPos.top - tooltipPos.height - spacing;
      left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
  }

  // Add scroll offset
  top += window.scrollY;
  left += window.scrollX;

  // Set Position  using Renderer2.setStyle() from @angular/core
  this.renderer.setStyle(this.tooltip, 'top', `${top}px`);
  this.renderer.setStyle(this.tooltip, 'left', `${left}px`);
 }

 // STYLE ARROW BASED ON POSITION
 private styleArrow(arrow: HTMLElement): void {
  // Common arrow style
  const arrowClasses = ['absolute', 'w-2', 'h-2', 'bg-gray-900', 'transform', 'rotate-45']
  arrowClasses.forEach(cls => this.renderer.addClass(arrow, cls));

  // Position-specific styles
  switch(this.tooltipPosition) {
    case 'top':
      this.renderer.setStyle(arrow, 'bottom', '-4px');
      this.renderer.setStyle(arrow, 'left', '50%');
      this.renderer.setStyle(arrow, 'transform', 'translateX(-50%) rotate(45deg)');
      break;
    case 'bottom':
      this.renderer.setStyle(arrow, 'top', '-4px');
      this.renderer.setStyle(arrow, 'left', '50%');
      this.renderer.setStyle(arrow, 'transform', 'translateX(-50%) rotate(45deg)');
      break;
    case 'left':
      this.renderer.setStyle(arrow, 'right', '-4px');
      this.renderer.setStyle(arrow, 'top', '-50%');
      this.renderer.setStyle(arrow, 'transform', 'translateY(-50%) rotate(45deg)');
      break;
    case 'right':
      this.renderer.setStyle(arrow, 'left', '-4px');
      this.renderer.setStyle(arrow, 'top', '50%');
      this.renderer.setStyle(arrow, 'transform', 'translateY(-50%) rotate(45deg)');
      break;
  }
 }

 // REMOVE TOOLTIP FROM DOM
 private destroyTooltip(): void {
  if(this.tooltip) {
    this.renderer.removeChild(document.body, this.tooltip);
    this.tooltip = null;
    console.log('💬 Tooltip removed');
  }
 }

 // Cleanup on destroy
 ngOnDestroy(): void {
   this.destroyTooltip();
   if (this.showTimeout) {
    clearTimeout(this.showTimeout);
   }
 }
}
