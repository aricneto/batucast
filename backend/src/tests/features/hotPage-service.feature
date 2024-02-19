Scenario: Ordenar top músicas em ordem decrescente
Given as músicas de id "1" e "2" estão na lista do em alta
When o sistema compara o número de vezes que ja foram tocadas
And o valor retornado para o id "1" é "6"
And o valor retornado para o id "2" é "12"
Then a música de id "1" fica num ranking acima da música de id "2"
