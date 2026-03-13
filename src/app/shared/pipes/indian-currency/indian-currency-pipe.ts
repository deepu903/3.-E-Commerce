import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indianCurrency'
})
export class IndianCurrencyPipe implements PipeTransform {

  transform(value: number| string, showSymbol: boolean = true, decimals: number = 0): string {
      
      /** STEP 1: VALIDATION & PARSING */

      // handle null/undefined
      if(value === null || value === undefined || value === '') {
      return showSymbol ? '₹0' : '0';
    }

    // Convert to number if string
    let numValue: number;
    if(typeof value === 'string') {
      numValue = parseFloat(value);
    } else {
      numValue = value;
    }

    // Handle NaN
    if(isNaN(numValue)) {
      return showSymbol ? '₹0' : '0';
    }


    /** STEP 2: HANDLE NEGATIVE NUMBERS */
    const isNegative = numValue < 0;
    numValue = Math.abs(numValue);

    /** STEP 3: FORMAT THE DECIMALS */
    const formattedValue = numValue.toFixed(decimals);

    /** STEP 4: SPLIT INTEGER AND DECIMAL PARTS */
    const [integerPart, decimalPart] = formattedValue.split('.');

    /** STEP 5: APPLY INDIAN SYSTEM FORMATTING */
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);

    let formattedInteger: string;
    if(otherNumbers !== '') {
      // Add commas every 2 digits in otherNumbers
      formattedInteger = otherNumbers.replace(/\B(\d{2})+(?!\d)/g, ',');
      formattedInteger += ',' + lastThree;  
    } else {
      formattedInteger = lastThree;
    }

    /** STEP 6: COMBINE INTEGER AND DECIMAL */
    let result = formattedInteger;

    if(decimals > 0 && decimalPart) {
      result += '.' + decimalPart;
    }

    /** STEP 7: ADD SYMBOL AND NEGATIVE SIGN */
    if(showSymbol) {
      result = '₹' + result;
    }

    if(isNegative) {
      result = '-' + result;
    }
    return result;
  }
}
