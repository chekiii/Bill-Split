import { useMemo } from 'react';

/**
 * @typedef {{
 * id: string, 
 * name: string, 
 * price: number, 
 * totalQty: number, 
 * assignments: {[personId: string]: number},
 * sharedPortion: { quantity: number, shareCount: number, sharers: string[] }
 * }} Item
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
 * A hook to calculate the bill split summary for each person, including shared items.
 * @param {Item[]} items - The list of bill items.
 * @param {Person[]} people - The list of people splitting the bill.
 * @param {number} totalTaxAmount - The total fixed tax amount from the bill.
 * @param {number} totalTipAmount - The total fixed tip amount to be split equally.
 * @returns {PersonSummary[]} The calculated summary for each person.
 */
export const useBillCalculator = (items, people, totalTaxAmount, totalTipAmount) => {
  return useMemo(() => {
    // The total price of all items on the bill (the subtotal).
    const totalItemsPrice = items.reduce((sum, item) => sum + item.price, 0);
    const numberOfPeople = people.length > 0 ? people.length : 1;

    if (totalItemsPrice === 0) {
      return people.map(p => ({
        personId: p.id,
        personName: p.name,
        subtotal: 0, taxShare: 0, tipShare: 0, total: 0,
      }));
    }

    // The tip is split equally among everyone who has joined.
    const tipSharePerPerson = totalTipAmount / numberOfPeople;

    const summaries = people.map((person) => {
      let subtotal = 0;

      // Iterate through each item to calculate this person's share.
      items.forEach(item => {
        const pricePerUnit = item.totalQty > 0 ? item.price / item.totalQty : 0;

        // 1. Add cost from their INDIVIDUAL claims.
        const individualQty = item.assignments?.[person.id] || 0;
        if (individualQty > 0) {
          subtotal += pricePerUnit * individualQty;
        }

        // 2. Add cost from their participation in SHARED portions.
        const sharedPortion = item.sharedPortion;
        if (sharedPortion && sharedPortion.sharers.includes(person.id)) {
          const priceOfSharedUnits = pricePerUnit * sharedPortion.quantity;
          const costPerSharer = sharedPortion.shareCount > 0 
            ? priceOfSharedUnits / sharedPortion.shareCount 
            : 0;
          subtotal += costPerSharer;
        }
      });

      // Calculate proportional tax and the final total.
      const proportion = totalItemsPrice > 0 ? subtotal / totalItemsPrice : 0;
      const taxShare = totalTaxAmount * proportion;
      const total = subtotal + taxShare + tipSharePerPerson;

      return {
        personId: person.id,
        personName: person.name,
        subtotal,
        taxShare,
        tipShare: tipSharePerPerson,
        total,
      };
    });

    return summaries;
  }, [items, people, totalTaxAmount, totalTipAmount]);
};