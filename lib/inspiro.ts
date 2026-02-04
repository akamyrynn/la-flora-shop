const INSPIRO_API_URL = process.env.INSPIRO_API_URL;
const INSPIRO_API_KEY = process.env.INSPIRO_API_KEY;

export async function getBonusBalance(cardNumber: string): Promise<number> {
  const response = await fetch(`${INSPIRO_API_URL}/bonus/balance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${INSPIRO_API_KEY}`,
    },
    body: JSON.stringify({ card_number: cardNumber }),
  });
  
  const data = await response.json();
  return data.balance || 0;
}

export async function useBonuses(cardNumber: string, amount: number): Promise<boolean> {
  const response = await fetch(`${INSPIRO_API_URL}/bonus/use`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${INSPIRO_API_KEY}`,
    },
    body: JSON.stringify({ card_number: cardNumber, amount }),
  });
  
  return response.ok;
}

export async function addBonuses(cardNumber: string, amount: number): Promise<boolean> {
  const response = await fetch(`${INSPIRO_API_URL}/bonus/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${INSPIRO_API_KEY}`,
    },
    body: JSON.stringify({ card_number: cardNumber, amount }),
  });
  
  return response.ok;
}
