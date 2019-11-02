import {
  Pokemon,
  NamedAPIResourceList,
  PokemonSpecies,
  APIResource,
  NamedAPIResource
} from "./types";

export const wait = (time: number) =>
  new Promise(resolve => setTimeout(resolve, time));

async function fetchPokemonList({
  limit = 20,
  offset = 0
}: {
  limit: number;
  offset: number;
}): Promise<NamedAPIResourceList> {
  await wait(500);
  let response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
  );
  return response.json();
}
export type Resource<T> = {
  read(): T;
};
export function wrapPromise<T>(promise: Promise<T>): Resource<T> {
  let status = "pending";
  let result: any;
  let suspender = promise.then(
    r => {
      status = "success";
      result = r;
    },
    e => {
      status = "error";
      result = e;
    }
  );
  return {
    read() {
      if (status === "pending") {
        throw suspender;
      } else if (status === "error") {
        throw result;
      } else if (status === "success") {
        return result;
      }
    }
  };
}

export async function fetchUrl<T>(url: string): Promise<T> {
  await wait(500 * Math.random() + 200);
  let response = await fetch(url);
  return response.json();
}

export function fetchPokemonListResource() {
  return {
    pokemons: wrapPromise(
      fetchPokemonList({
        offset: 0,
        limit: 20
      }).then(pokemon => {
        return {
          ...pokemon,
          results: pokemon.results.map(result => {
            return {
              ...result,
              resource: wrapPromise(
                fetchUrl<Pokemon>(result.url).then(pokemon => {
                  return {
                    ...pokemon,
                    speciesResource: wrapPromise(
                      fetchUrl<PokemonSpecies>(pokemon.species.url)
                    )
                  };
                })
              )
            };
          })
        };
      })
    )
  };
}

type Fetcher<TInput, TOutput> = (data: TInput) => Promise<TOutput>;

function createFetcher<TInput, TOutput>(
  getUrl: (params: TInput) => string
): Fetcher<TInput, TOutput> {
  return async (data: TInput) => {
    let url = getUrl(data);
    return fetchUrl<TOutput>(url);
  };
}

function createLoader<TInput, TFetched, TAddition>(
  fetcher: Fetcher<TInput, TFetched>,
  transformer: (data: TFetched) => TAddition
): (input: TInput) => Resource<TFetched & TAddition> {
  return (data: TInput) => {
    return wrapPromise(
      fetcher(data).then(fetched => {
        let additions = transformer(fetched);
        return {
          ...fetched,
          ...additions
        };
      })
    );
  };
}

let allFetcher = createFetcher<any, NamedAPIResourceList>(
  params => `https://pokeapi.co/api/v2/pokemon`
);
let pokemonFetcher = createFetcher<APIResource, Pokemon>(
  (resource: APIResource) => resource.url
);
let pokemonSpeciesFetcher = createFetcher<Pokemon, PokemonSpecies>(
  (pokemon: Pokemon) => pokemon.species.url
);

let pokemonSpeciesLoader = createLoader(
  pokemonSpeciesFetcher,
  (species: PokemonSpecies) => {
    return {};
  }
);

let pokemonLoader = createLoader(pokemonFetcher, (resource: Pokemon) => {
  return {
    speciesResource: pokemonSpeciesLoader(resource)
  };
});

export const allLoader = createLoader(
  allFetcher,
  (resource: NamedAPIResourceList) => {
    return {
      results: resource.results.map(pokemon => {
        return {
          ...pokemon,
          resource: pokemonLoader(pokemon)
        };
      })
    };
  }
);

// createLoader(allFetcher, (data: NamedAPIResourceList) => ({
//   results: listTransform(data.results, (result: NamedAPIResource) => ({
//     resource: pokemonLoader(result, (pokemon: Pokemon) => ({
//       speciesResource: pokemonSpeciesLoader(pokemon)
//     }))
//   }))
// }));
