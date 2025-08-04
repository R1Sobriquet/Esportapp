import React, { useEffect, useState } from "react";
import { fetchGames } from "../services/gameService";

export default function Home() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetchGames().then(setGames);
  }, []);

  return (
    <div>
      <h2>Liste des jeux</h2>
      <ul>
        {games.map((game) => (
          <li key={game.id}>
            {game.name} ({game.category})
          </li>
        ))}
      </ul>
    </div>
  );
}