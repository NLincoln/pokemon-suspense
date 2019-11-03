import {
  Pokemon,
  NamedAPIResourceList,
  PokemonSpecies,
  APIResource
} from "./types";

export const wait = (time: number) =>
  new Promise(resolve => setTimeout(resolve, time));

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

type Fetcher<TInput, TOutput> = (data: TInput) => Promise<TOutput>;

export function createFetcher<TInput, TOutput>(
  getUrl: (params: TInput) => string
): Fetcher<TInput, TOutput> {
  return async (data: TInput) => {
    let url = getUrl(data);
    return fetchUrl<TOutput>(url);
  };
}

type Loader<TInput, TFetched> = <TAddition>(
  input: TInput,
  transfomer?: (data: TFetched) => TAddition
) => Resource<TFetched & TAddition>;

export function createLoader<TInput, TFetched>(
  fetcher: Fetcher<TInput, TFetched>
): Loader<TInput, TFetched> {
  return <TAddition>(
    input: TInput,
    transformer?: (data: TFetched) => TAddition
  ) => {
    return wrapPromise(
      fetcher(input).then(fetched => {
        let additions = {} as any;
        if (typeof transformer === "function") {
          additions = transformer(fetched);
        }
        return {
          ...fetched,
          ...additions
        };
      })
    );
  };
}

export function createTreeLoader<TInput, TFetched, TAddition>(
  fetcher: Fetcher<TInput, TFetched>,
  transformer: (data: TFetched) => TAddition
): (input: TInput) => Resource<TFetched & TAddition> {
  return (input: TInput) => {
    return wrapPromise(
      fetcher(input).then(fetched => {
        let additions = transformer(fetched);
        return {
          ...fetched,
          ...additions
        };
      })
    );
  };
}

export function listTransform<TData, TAddition>(
  data: TData[],
  mapper: (element: TData) => TAddition
): Array<TData & TAddition> {
  return data.map(value => {
    return {
      ...value,
      ...mapper(value)
    };
  });
}

export let allFetcher = createFetcher<
  { limit: number; offset: number },
  NamedAPIResourceList
>(
  params =>
    `https://pokeapi.co/api/v2/pokemon?limit=${params.limit ||
      20}&offset=${params.offset || 0}`
);
let pokemonFetcher = createFetcher<APIResource, Pokemon>(
  (resource: APIResource) => resource.url
);
let pokemonSpeciesFetcher = createFetcher<Pokemon, PokemonSpecies>(
  (pokemon: Pokemon) => pokemon.species.url
);

export let pokemonSpeciesLoader = createLoader(pokemonSpeciesFetcher);

export let pokemonLoader = createLoader(pokemonFetcher);
