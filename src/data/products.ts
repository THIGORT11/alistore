export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  tags: string[];
  aiHint: string;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Antoñico vamos de paseo',
    description: 'El muñeco Antoñico está listo para un divertido paseo. Incluye ropita y accesorios para disfrutar al aire libre.',
    price: 34,
    images: ['https://i.imgur.com/HJz8lL4.jpeg'],
    category: 'Muñecos',
    tags: ['nuevo', 'muñeco', 'paseo'],
    aiHint: 'strolling doll',
  },
  {
    id: '2',
    name: 'Adrián vamos al cole',
    description: 'Adrián está preparado para su primer día de cole. Con su mochila y uniforme, está listo para aprender y jugar.',
    price: 60,
    images: ['https://i.imgur.com/DTGaVmi.jpeg'],
    category: 'Muñecos',
    tags: ['nuevo', 'muñeco', 'colegio'],
    aiHint: 'school doll',
  },
  {
    id: '3',
    name: 'Ani día de peluquería',
    description: 'Ani va a la peluquería para ponerse guapa. Peina su largo pelo y utiliza los accesorios para crear peinados increíbles.',
    price: 51,
    images: ['https://i.imgur.com/iLujnxM.jpeg'],
    category: 'Muñecos',
    tags: ['nuevo', 'muñeco', 'pelo'],
    aiHint: 'hairdresser doll',
  },
  {
    id: '4',
    name: 'Lagrimitas hora de comer',
    description: 'El bebé lagrimitas tiene hambre. Dale de comer con su biberón y cuídalo. ¡Si le aprietas la barriguita, llora lágrimas de verdad!',
    price: 34,
    images: ['https://i.imgur.com/orr2NtV.jpeg'],
    category: 'Muñecos',
    tags: ['nuevo', 'muñeco', 'bebe'],
    aiHint: 'crying doll eating',
  },
];
