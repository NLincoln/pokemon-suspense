import React, { Suspense, SuspenseList, useState } from "react";
import {
  Resource,
  createTreeLoader,
  listTransform,
  pokemonLoader,
  pokemonSpeciesLoader,
  allFetcher
} from "../api";
import {
  NamedAPIResourceList,
  NamedAPIResource,
  Pokemon,
  PokemonSpecies
} from "../types";
import {
  Grid,
  Card,
  CardHeader,
  CardMedia,
  Theme,
  CardContent,
  Typography,
  Button
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { makeStyles, createStyles } from "@material-ui/styles";
import { capitalize } from "lodash";

const homePageLoader = createTreeLoader(
  allFetcher,
  (data: NamedAPIResourceList) => ({
    results: listTransform(data.results, (result: NamedAPIResource) => ({
      resource: pokemonLoader(result, (pokemon: Pokemon) => ({
        speciesResource: pokemonSpeciesLoader(pokemon)
      }))
    }))
  })
);

export default function HomePage() {
  let [data] = useState(() => homePageLoader(null));
  return (
    <Suspense fallback={"loading ;)"}>
      <PokemonList resource={data} />
    </Suspense>
  );
}

function PokemonList(props: {
  resource: Resource<
    NamedAPIResourceList<{
      name: string;
      resource: Resource<
        Pokemon & { speciesResource: Resource<PokemonSpecies> }
      >;
    }>
  >;
}) {
  let pokemon = props.resource.read();
  return (
    <Grid container spacing={2}>
      <SuspenseList revealOrder={"forwards"}>
        {pokemon.results.map(mon => {
          return (
            <Grid item key={mon.url} xs={12} sm={6} md={3}>
              <Suspense fallback={`${capitalize(mon.name)} Loading...`}>
                <PokemonView resource={mon.resource} />
              </Suspense>
            </Grid>
          );
        })}
      </SuspenseList>
    </Grid>
  );
}

let useStyles = makeStyles((theme: Theme) =>
  createStyles({
    media: {
      height: 0,
      paddingTop: "56.25%",
      imageRendering: "pixelated"
    }
  })
);

function PokemonView(props: {
  resource: Resource<Pokemon & { speciesResource: Resource<PokemonSpecies> }>;
}) {
  let data = props.resource.read();
  let species = data.speciesResource.read();
  let classes = useStyles();

  let flavorText = species.flavor_text_entries.find(
    entry => entry.language.name === "en"
  );

  return (
    <>
      <Card>
        <CardHeader
          title={capitalize(data.name)}
          action={
            <Button
              component={Link}
              to={"/pokemon/" + data.id}
              size={"small"}
              color={"primary"}
            >
              View
            </Button>
          }
        />
        <CardMedia
          image={data.sprites.front_default}
          className={classes.media}
        />
        <CardContent>
          {flavorText && (
            <Typography variant={"body2"} component={"p"}>
              {flavorText.flavor_text}
            </Typography>
          )}
        </CardContent>
      </Card>
    </>
  );
}
