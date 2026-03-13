import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {

  transform(value: Date | string |Number, ShowFullDate: Boolean = true): string {
    // STEP 1: VALIDATION
    if(!value) {
      return '';
    }

    //STEP 2: CONVERT TO DATE OBJECT
    let date = new Date();

    if(value instanceof Date) {
      date = value;
    } else if(typeof value === 'string'){
      date = new Date(value);
    } else if(typeof value === 'number'){
      date = new Date(value);
    } else {
      return '';
    }

    // Validate date
    if(isNaN(date.getTime())) {
      return 'Invalid Date'
    }

    //STEP 3: CALCULATE TIME DIFFERENCE
    const now = new Date();
    const DiffInMilliSeconds = now.getTime() - date.getTime();

    // If date is in future
    if(DiffInMilliSeconds < 0) {
      return 'in the future';
    }

    // STEP 4: CONVERT TO DIFFERENT TIME UNITS
    const seconds = Math.floor(DiffInMilliSeconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    // STEP: 5 RETURN APPROPRIATE STRING
    if(seconds < 30) {
      return 'Just now';
    }
  
    // Seconds (< 1 minute)
    if(seconds < 60) {
      return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;
    }
    
    // Minutes (< 1 hour)
    if(minutes < 60) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    // Hours (< 1 day)
    if(hours < 24) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    // Days (< 1 week)
    if(days < 7) {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }

    // Weeks (< 1 month)
    if(weeks < 4) {
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }

    // Months (< 1 year)
    if(months < 12) {
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }

    // Years
    if(ShowFullDate && years >= 1) {
      // For old dates, show full date
      return this.formatFullDate(date);
    } else {
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
  }

  // FORMAT FULL DATE
  private formatFullDate(date: Date): string {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  }

}

