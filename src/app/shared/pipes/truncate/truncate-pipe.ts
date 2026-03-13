import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  transform(value: string, limit: number = 10, ellipsis: string = '...', completeWords: boolean = false): string {
  // Return empty string if value is null/undefined
  if(!value) return '';

  // Return original if limit is 0 or negative
  if(limit <= 0) return value;

  // Return original if already shorter than limit
  if(value.length <= limit) return value;

  // Calculate actual limit (account for ellipsis length)
  const actualLimit = limit - ellipsis.length;

  // Get truncated text
  let truncated = value.substring(0, actualLimit);
  
  if(completeWords) {
    const lastSpace = truncated.lastIndexOf('');
    if(lastSpace > 0) {
      // Cut at last space
      truncated = truncated.substring(0, lastSpace);
    }
  }

  truncated = truncated.trim();
  return truncated + ellipsis;
  }

}
