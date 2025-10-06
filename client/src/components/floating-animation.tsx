interface FloatingElement {
  image: string;  
}

interface FloatingAnimationProps {
  elements?: FloatingElement[] ;
  className?: string;
}

export default function FloatingAnimation({ 
  elements = [
    { image: '/src/assets/1.png' },
    { image: '/src/assets/2.png' },
    { image: '/src/assets/3.png' },
    { image: '/src/assets/4.png' },
    { image: '/src/assets/5.png' },
    { image: '/src/assets/6.png' },
    { image: '/src/assets/7.png' },
    { image: '/src/assets/8.png' },
    { image: '/src/assets/9.png' },
    { image: '/src/assets/10.png' },
    { image: '/src/assets/11.png' },
    { image: '/src/assets/12.png' },
  ],
  className = ""
}: FloatingAnimationProps) {
  const positions = [
    'top-40 left-24 text-7xl opacity-20',
    'top-20 right-40 text-6xl opacity-15',
    'top-[25rem] left-20 text-7xl opacity-15',
    'bottom-80 right-32 text-6xl opacity-20',
    'bottom-60 left-44 text-5xl opacity-15',
    'top-96 right-20 text-6xl opacity-20',
    'bottom-[35rem] left-36 text-7xl opacity-15',
    'top-[40rem] left-52 text-6xl opacity-20',
    'bottom-[32rem] right-48 text-7xl opacity-15',
    'top-1/3 right-8 text-6xl opacity-20',
    'bottom-1/5 left-1/6 text-5xl opacity-15',
    'top-30 right-1/5 text-7xl opacity-20'
  ];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {elements.map((element, index) => (
        <div
          key={index}
          className={`floating-element absolute animate-float ${positions[index] || positions[0]}`}
        >
          <img
            src={element.image}
            alt=""
            className="w-24 h-24 opacity-90"
          />
        </div>
      ))}
    </div>
  );
}
