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
  {
    id: '5',
    name: 'Stitch playero',
    description: 'Figura de Stitch listo para un día de playa.',
    price: 13,
    images: ['https://i.imgur.com/lhTaj17.jpeg'],
    category: 'Figuras',
    tags: ['figura', 'stitch', 'playa'],
    aiHint: 'beach stitch',
  },
  {
    id: '6',
    name: 'Stitch dormilón',
    description: 'Adorable figura de Stitch durmiendo.',
    price: 10,
    images: ['https://i.imgur.com/rLHw6up.jpeg'],
    category: 'Figuras',
    tags: ['figura', 'stitch', 'dormir'],
    aiHint: 'sleeping stitch',
  },
  {
    id: '7',
    name: 'Stitch',
    description: 'Figura clásica de Stitch.',
    price: 5,
    images: ['https://i.imgur.com/KTDpY9I.jpeg'],
    category: 'Figuras',
    tags: ['figura', 'stitch'],
    aiHint: 'stitch figure',
  },
  {
    id: '8',
    name: 'Muñeco de nieve',
    description: 'Figura de un simpático muñeco de nieve.',
    price: 5,
    images: ['https://i.imgur.com/McuOcrW.jpeg'],
    category: 'Figuras',
    tags: ['figura', 'nieve', 'navidad'],
    aiHint: 'snowman figure',
  },
  {
    id: '9',
    name: 'Minnie mouse',
    description: 'Figura clásica de Minnie Mouse.',
    price: 5,
    images: ['https://i.imgur.com/huE2yWw.jpeg'],
    category: 'Figuras',
    tags: ['figura', 'minnie', 'disney'],
    aiHint: 'minnie mouse',
  },
  {
    id: '10',
    name: 'Caja premium',
    description: 'Muñeco + accesorio + ropa + peluche',
    price: 40,
    images: ['https://placehold.co/600x400.png'],
    category: 'Cajas',
    tags: ['caja', 'premium', 'sorpresa'],
    aiHint: 'premium box',
  },
  {
    id: '11',
    name: 'Caja estándar',
    description: 'mini muñeco + accesorio',
    price: 20,
    images: ['https://placehold.co/600x400.png'],
    category: 'Cajas',
    tags: ['caja', 'estandar', 'sorpresa'],
    aiHint: 'standard box',
  },
];
