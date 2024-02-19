Feature: Hot
As an user
I want to be able to access the top songs, artists, podcasts and playlists
So that I can see the current most listened songs, artists, podcasts or playlists.

Scenario: Show the top songs
Given já existem “12” músicas cadastradas
When uma requisição “GET” for enviada para a rota “/hot”
Then o status da resposta é “200”
And o JSON da resposta deve conter os ids e nomes das 5 músicas mais tocadas.
Scenario: Show the top songs by genre
Given existem “6” músicas cadastradas com gênero “MPB”
When uma requisição “GET” for enviada para a rota “/hot?genre=MPB”
Then o status da resposta é “200”
And o JSON da resposta deve conter os ids e nomes das 5 músicas mais tocadas

Scenario: Deletar uma música que estava no top songs
Given o top songs está preenchido com 10 músicas
And entre elas está a música chamada “X” na “1º” posição
And a 11° música mais escutada se chama “Y”
When “X” é deletada do banco de dados através de uma requisição “DELETE”
Then o status da resposta do “DELETE” é “204”
And a lista do top 10 sofre uma alteração onde todas as músicas que estavam
abaixo da primeira opção sobem de ranking
And a música Y entra para a 10° posição 

Scenario: Obter top 5 músicas quando há menos cadastradas
Given há “4” músicas cadastradas no sistema
When uma requisição “GET” é feita para a rota “/hot”
Then o status da resposta é “200”
And o JSON da resposta inclui todas as “4” músicas ordenadas por vezes que já foram tocadas
And o 5° lugar não é preenchido

Scenario: Obter top 5 músicas de determinado gênero quando há menos cadastradas
Given há “10” músicas cadastradas
And “4” delas são do gênero “MPB”
When uma  requisição “GET” é feita para a rota “/hot?genre=MPB”
Then o status da resposta é “200”
And o JSON inclui apenas as “4” músicas do estilo MPB

