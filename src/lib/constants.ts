export const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Bags'] as const
export const OCCASIONS = ['Casual', 'Work', 'Date Night', 'Evening Out', 'Brunch', 'Gym', 'Travel', 'Formal', 'Interview'] as const
export const WEATHER_OPTIONS = ['Hot', 'Warm', 'Mild', 'Cool', 'Cold', 'Rainy'] as const

export const CATEGORY_ICONS: Record<string, string> = {
  Tops: 'T', Bottoms: 'B', Dresses: 'D', Outerwear: 'O',
  Shoes: 'S', Accessories: 'A', Bags: 'G',
}
