Feature: Hot

Scenario: Mostrar as top músicas
Given já existem 6 músicas de ids "1", "2", "3", "4", "5", "6" cadastradas
And suas respectivas quantidades de vezes já tocadas é "1", "2", "3", "4", "5", "6"
When uma requisição GET for enviada para a rota "/api/hot"
Then o status da resposta é 200
And o JSON da resposta deve conter os ids e nomes das 5 músicas mais tocadas

# Scenario: Mostrar as top músicas por gênero
# Given existem "6" músicas cadastradas com gênero "MPB"
# When uma requisição "GET" for enviada para a rota "/hot?genre=MPB"
# Then o status da resposta é "200"
# And o JSON da resposta deve conter os ids e nomes das 5 músicas mais tocadas do gênero "MPB"
# 
# Scenario: Obter top 5 músicas quando há menos cadastradas
# Given há "4" músicas cadastradas no sistema
# When uma requisição "GET" for enviada para a rota "/hot"
# Then o status da resposta é "200"
# And o JSON da resposta inclui todas as "4" músicas ordenadas por vezes que já foram tocadas
# And o restante das posições não são preenchidas
# 
# Scenario: Obter top 5 músicas de determinado gênero quando há menos cadastradas
# Given há "10" músicas cadastradas no sistema
# And "4" delas são do gênero "MPB"
# When uma  requisição "GET" for enviada para a rota "/hot?genre=MPB"
# Then o status da resposta é "200"
# And o JSON da resposta inclui os ids e nomes apenas das "4" músicas do estilo "MPB"
# 
# Scenario: Inserir na URL um gênero não cadastrado na base de dados
# Given não há músicas do gênero "generonaoexistente"
# When uma  requisição "GET" for enviada para a rota "/hot?genre=generonaoexistente"
# Then o status da resposta é "404"
# And a mensagem retornada é "Genre not found"