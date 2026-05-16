import json

with open('weapons.json', encoding='utf-8') as f:
    data = json.load(f)

armas = [a['nombre'] for a in data['armas']]
camuflajes = (
    data['camuflajes']['zombies'] +
    data['camuflajes']['multijugador'] +
    data['camuflajes']['campaña']
)
camuflaje_armas = set(c['arma_asociada'] for c in camuflajes)

sin_camuflaje = [a for a in armas if a not in camuflaje_armas]

if sin_camuflaje:
    print('Armas sin camuflaje vinculado:')
    for arma in sin_camuflaje:
        print('-', arma)
else:
    print('Todas las armas tienen al menos un camuflaje vinculado.')
