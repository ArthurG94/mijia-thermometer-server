
# Présentation

Créé un serveur Web permetant de s'interfacer avec les thermomètres xaomi mijia.


## Installation 

`npm i`
`npm run build`

## Configuration 

Le fichier `config.json` permet de configurer le serveur Web ainsi que les alias

```json

{
	"webServer": {
		"port": "8000" //Port sur lequel le serveur Web écoute
	},
	"alias": {
		"aa:bb:cc:dd:ee:ff": "alias1" //Déclaration d'un alias pour l'adresse MAC aa:bb:cc:dd:ee:ff
	}
}

```

## Routes

`/scan/:timeout?` Recherche les thermomètres jusqu'au timeout (10s par défaut). La variable `timeout` est exprimée en seconde

*Réponse:*
```typescript
{
	err: string | null,
	data: MAC[] | null
}
```

`/read/:mac` Lit le thermomètre correspondant à l'adresse mac donnée en paramètre.
Un timeout est levé au bout de 30s si aucune donnée n'a été lue

*Réponse:*
```typescript
{
	err: string | null,
	data: {
		mac: string,
		temperature : number
		humidity : number
		voltage : number
		voltagePercent : number
	} | null
}
```

`/read-alias/:alias` Lit le thermomètre correspondant à l'alias donnée en paramètre.
Un timeout est levé au bout de 30s si aucune donnée n'a été lue

*Réponse:*
```typescript
{
	err: string | null,
	data: {
		alias:string,
		mac: string,
		temperature : number
		humidity : number
		voltage : number
		voltagePercent : number
	} | null
}
```