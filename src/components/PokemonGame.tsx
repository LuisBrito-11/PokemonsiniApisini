import React, { useEffect, useState } from 'react';
import QuienEsEstePokemon from '../assets/quien-es-este-pokemon.png';

type Pokemon = {
  name: string;
  image: string;
};

const getRandomPokemonId = () => Math.floor(Math.random() * 151) + 1;

const PokemonGame: React.FC = () => {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [input, setInput] = useState('');
  const [reveal, setReveal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [streak, setStreak] = useState(0); // Estado para la racha
  const [hasGuessedCorrectly, setHasGuessedCorrectly] = useState(false); // Estado para evitar incrementos múltiples

  const fetchPokemon = async () => {
    setIsLoading(true);
    setReveal(false);
    setHasGuessedCorrectly(false); // Reiniciar para el nuevo Pokémon
    const id = getRandomPokemonId();
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();

    const name = data.name.toLowerCase();
    const image = data.sprites.other['official-artwork'].front_default;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      setPokemon({ name, image });
      setIsLoading(false);
      setFeedback('');
      setInput('');
    };
  };

  const handleGuess = () => {
    if (!pokemon || hasGuessedCorrectly) return; // Evitar más intentos si ya adivinó
    setAttempts((prev) => prev + 1);
    
    if (input.trim().toLowerCase() === pokemon.name) {
      setStreak(prev => prev + 1); // Incrementar racha
      setReveal(true);
      setFeedback('¡Correcto!');
      setScore((prev) => prev + 1);
      setHasGuessedCorrectly(true); // Marcar que ya adivinó

      const cry = new Audio(`https://play.pokemonshowdown.com/audio/cries/${pokemon.name}.ogg`);
      cry.play().catch(() => console.log("Sonido no disponible para este Pokémon"));
      setAudio(cry);

    } else {
      setStreak(0); // Reiniciar racha
      setFeedback('¡Incorrecto! Intenta de nuevo.');
    }
  };

  useEffect(() => {
    fetchPokemon();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-8 w-full max-w-none m-0 p-0">
      <img
        src={QuienEsEstePokemon}
        alt="¿Quién es este Pokémon?" 
        className="max-w-2xl h-auto object-contain mb-2"
      />

      <div className="flex-grow flex items-center justify-center">
        {isLoading ? (
          <div className="w-60 h-60 flex items-center justify-center text-white">
            <p>Cargando...</p>
          </div>
        ) : (
          pokemon && (
            <img
            onContextMenu={(e) => e.preventDefault()}
              src={pokemon.image}
              draggable="false"
              alt="Pokémon misterioso"
              className={`w-60 h-60 object-contain transition-filter duration-500 ${
                reveal ? 'brightness-100' : 'brightness-0'
              }`}
            />
          )
        )}
      </div>

      <div className="flex flex-col items-center gap-4 w-full max-w-md px-4 pb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-4 py-2 rounded-full bg-transparent text-white placeholder-gray-400 border-4 border-black focus:outline-none"
          placeholder="Escribe el nombre..."
        />
        <button
          onClick={handleGuess}
          className="w-16 h-16 bg-transparent rounded-full focus:outline-none hover:scale-110 transition-transform duration-300"
          disabled={hasGuessedCorrectly}
          title="¡Adivinar!"
        >
          <img
            src="https://images.wikidexcdn.net/mwuploads/wikidex/thumb/8/87/latest/20210226185630/Pok%C3%A9_Ball_%28Hisui%29_%28Ilustraci%C3%B3n%29.png/640px-Pok%C3%A9_Ball_%28Hisui%29_%28Ilustraci%C3%B3n%29.png"
            alt="Pokébola"
            className="w-full h-full object-contain"
          />
        </button>
        <p className="text-lg font-semibold text-center text-white">{feedback}</p>
        <div className="flex justify-between w-full text-sm">
          <span className={`${streak >= 2 ? 'flame-text' : 'text-white'}`}>
            Puntaje: {score}
          </span>
          <span className="text-white">Intentos: {attempts}</span>
        </div>
        <button
          onClick={fetchPokemon}
          className="text-yellow-300 underline hover:text-yellow-400 font-semibold"
          disabled={isLoading}
        >
          Nuevo Pokémon
        </button>
      </div>
    </div>
  );
};

export default PokemonGame;