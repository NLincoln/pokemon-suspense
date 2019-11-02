export type NamedAPIResource<T = {}> = APIResource<T> & { name: string };
export type APIResource<T = {}> = T & { url: string };

export type APIResourceList<TEntity = {}> = {
  count: number;
  next: string;
  previous: boolean;
  results: Array<APIResource<TEntity>>;
};

export type NamedAPIResourceList<TEntity = {}> = {
  count: number;
  next: string;
  previous: boolean;
  results: Array<NamedAPIResource<TEntity>>;
};

export type Pokemon = {
  id: number;
  name: string;
  height: number;
  stats: Array<PokemonStat>;
  sprites: {
    front_default: string;
  };
  species: NamedAPIResource;
};

export type PokemonSpecies = {
  id: number;
  name: string;
  flavor_text_entries: Array<FlavorText>;
};

export type FlavorText = {
  flavor_text: string;
  language: NamedAPIResource;
  version: NamedAPIResource;
};

export type PokemonStat = {
  stat: NamedAPIResource;
  effort: number;
  base_stat: number;
};

export type Stat = {
  id: number;
  name: string;
  game_index: number;
  is_battle_only: boolean;
};
