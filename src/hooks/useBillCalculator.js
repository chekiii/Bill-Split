import { useMemo } from 'react';

/**
 * @typedef {{id: string, name: string, price: number, totalQty: number, assignments: {[personId: string]: number}}} Item
 * @typedef {{id: string, name: string}} Person
 * @typedef {{
 * personId: string,
 * personName: string,
 * subtotal: number,
 * taxShare: number,
 * tipShare: number,
 * total: number
 * }} PersonSummary
 */

/**
 * A hook to calculate the bill split summary for each person.
 * @param {Item[]} items - The list of bill items.
 * @param {Person[]} people - The list of people splitting the bill.
 * @param {number} totalTaxAmount - The total fixed tax amount from the bill.
 * @param {number} totalTipAmount - The total fixed tip amount to be split equally.
 * @returns {PersonSummary[]} The calculated summary for each person.
 */
export const useBillCalculator = (items, people, totalTaxAmount, totalTipAmount) => {
  return useMemo(() => {
    const totalItemsPrice = items.reduce((sum, item) => sum + item.price, 0);
    const numberOfPeople = people.length > 0 ? people.length : 1; // Prevents division by zero

    if (totalItemsPrice === 0) {
      return people.map(p => ({
        personId: p.id,
        personName: p.name,
        subtotal: 0, taxShare: 0, tipShare: 0, total: 0,
      }));
    }

    // THE FIX: The tip share is now a simple, equal split.
    const tipSharePerPerson = totalTipAmount / numberOfPeople;

    const summaries = people.map((person) => {
      const subtotal = items.reduce((personSum, item) => {
        const assignedQty = item.assignments?.[person.id] || 0;
        if (assignedQty === 0) return personSum;
        const pricePerUnit = item.totalQty > 0 ? item.price / item.totalQty : 0;
        return personSum + pricePerUnit * assignedQty;
      }, 0);

      const proportion = subtotal / totalItemsPrice;
      const taxShare = totalTaxAmount * proportion;
      // Use the pre-calculated equal tip share for everyone
      const total = subtotal + taxShare + tipSharePerPerson;

      return {
        personId: person.id,
        personName: person.name,
        subtotal,
        taxShare,
        tipShare: tipSharePerPerson, // Assign the equal share
        total,
      };
    });

    return summaries;
  }, [items, people, totalTaxAmount, totalTipAmount]);
};