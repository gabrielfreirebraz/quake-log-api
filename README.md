## API Quake Log

Project to parse the Quake log file.

### Tecnologies

- NodeJS 18.16.1 + Express 4.19.2 + Typescript 5.4.5
- Docker 24.0.9

### Get started

```bash 
yarn  
or
npm install
   
docker-compose up -d
```

### Endpoints

# Game Report Request Route:

```
GET: http://{url}:3000/api/report     
```

# Player Ranking Request Route:

```
GET: http://{url}:3000/api/ranking     
```
   
# API Responses   

![API Response](src/media/VideoQuakeLogAPI.gif)
    
# Player Ranking Response Route:  
  
```json
{
  "playerRanking": {
    "kills": {
      "Isgalamido": 147,
      "Zeh": 124,
      "Oootsimo": 114,
      "Assasinu Credi": 111,
      "Dono da Bola": 63,
      "Chessus": 33,
      "Mocinha": 0,
      "Maluquinho": 0,
      "Fasano Again": 0,
      "UnnamedPlayer": 0,
      "Chessus!": 0,
      "Mal": -3
    },
    "deaths": {
      "Fasano Again": 0,
      "Chessus!": 0,
      "UnnamedPlayer": 1,
      "Maluquinho": 1,
      "Mocinha": 2,
      "Chessus": 55,
      "Oootsimo": 127,
      "Isgalamido": 153,
      "Zeh": 173,
      "Mal": 178,
      "Dono da Bola": 189,
      "Assasinu Credi": 190
    },
    "kd_ratio": {
      "Isgalamido": 0.99,
      "Oootsimo": 0.91,
      "Zeh": 0.75,
      "Assasinu Credi": 0.62,
      "Chessus": 0.6,
      "Dono da Bola": 0.37,
      "Mal": 0.07,
      "Mocinha": 0,
      "Fasano Again": 0,
      "UnnamedPlayer": 0,
      "Maluquinho": 0,
      "Chessus!": 0
    },
    "player_score": {
      "Isgalamido": 156.9,
      "Zeh": 131.5,
      "Oootsimo": 123.1,
      "Assasinu Credi": 117.2,
      "Dono da Bola": 66.7,
      "Chessus": 39,
      "Mocinha": 0,
      "Maluquinho": 0,
      "Fasano Again": 0,
      "UnnamedPlayer": 0,
      "Chessus!": 0,
      "Mal": -2.3
    }
  }
}
```

Game Report Response Route:
  
```json
{
  "game_1": {
    "total_kills": 0,
    "players": [
      "Isgalamido"
    ],
    "kills": {
      "Isgalamido": 0
    },
    "deaths": {
      "Isgalamido": 0
    },
    "kd_ratio": {
      "Isgalamido": 0
    },
    "player_score": {
      "Isgalamido": 0
    }
  },
  "game_2": {
    "total_kills": 15,
    "players": [
      "Isgalamido",
      "Dono da Bola",
      "Mocinha",
      "Zeh"
    ],
    "kills": {
      "Mocinha": 0,
      "Dono da Bola": -1,
      "Zeh": -2,
      "Isgalamido": -4
    },
    "deaths": {
      "Dono da Bola": 1,
      "Mocinha": 2,
      "Zeh": 2,
      "Isgalamido": 10
    },
    "kd_ratio": {
      "Isgalamido": 0,
      "Dono da Bola": 0,
      "Mocinha": 0,
      "Zeh": 0
    },
    "player_score": {
      "Isgalamido": 0,
      "Dono da Bola": 0,
      "Mocinha": 0,
      "Zeh": 0
    }
  },
  "game_3": {...}
}
```