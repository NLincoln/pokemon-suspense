import React, { useState, Suspense } from "react";
import { createTreeLoader, createFetcher, Resource } from "../api";
import { Pokemon } from "../types";
import { useParams } from "react-router-dom";
import { Container, Typography } from "@material-ui/core";
import { memoize } from "lodash";

const pokemonIdFetcher = createFetcher<string, Pokemon>(
  (params: string) => `https://pokeapi.co/api/v2/pokemon/` + params
);

const loader = memoize(createTreeLoader(pokemonIdFetcher, pokemon => ({})));

export default function PokemonDetail() {
  let { pokemon_id } = useParams<{ pokemon_id: string }>();
  let [resource] = useState(() => loader(pokemon_id));

  return <View resource={resource} />;
}

function View(props: { resource: Resource<Pokemon> }) {
  let pokemon = props.resource.read();
  return (
    <Container maxWidth={"sm"}>
      <Typography variant={"h1"}>{pokemon.name} </Typography>
    </Container>
  );
}
