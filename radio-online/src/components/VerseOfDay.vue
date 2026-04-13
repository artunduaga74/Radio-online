<template>
  <v-container class="py-4">
    <v-card rounded="xl" elevation="2" class="verse-card overflow-hidden">

      <!-- Franja de color superior -->
      <div class="verse-header px-5 pt-4 pb-3 d-flex align-center ga-3">
        <v-icon color="white" size="28">mdi-book-open-page-variant</v-icon>
        <div>
          <div class="text-caption text-white opacity-80 font-weight-medium" style="letter-spacing:1px">
            VERSÍCULO DEL DÍA
          </div>
          <div class="text-caption text-white opacity-70">{{ fechaHoy }}</div>
        </div>
      </div>

      <!-- Texto del versículo -->
      <v-card-text class="px-5 py-4">
        <p class="text-body-1 font-italic mb-3" style="line-height:1.7">
          "{{ verso.texto }}"
        </p>
        <p class="text-body-2 font-weight-bold text-primary">— {{ verso.ref }}</p>
      </v-card-text>

    </v-card>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'

const VERSOS = [
  { texto: 'Todo lo puedo en Cristo que me fortalece.',                                                                                              ref: 'Filipenses 4:13' },
  { texto: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.', ref: 'Juan 3:16' },
  { texto: 'El Señor es mi pastor; nada me faltará.',                                                                                               ref: 'Salmos 23:1' },
  { texto: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.',                                                            ref: 'Proverbios 3:5' },
  { texto: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.',                                                        ref: 'Mateo 11:28' },
  { texto: 'El Señor es mi luz y mi salvación; ¿a quién temeré?',                                                                                  ref: 'Salmos 27:1' },
  { texto: 'No os afanéis por nada; sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias.',       ref: 'Filipenses 4:6' },
  { texto: 'Confía en el Señor con todo tu corazón y no te apoyes en tu propio entendimiento.',                                                     ref: 'Proverbios 3:5' },
  { texto: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien.',                                                               ref: 'Romanos 8:28' },
  { texto: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal.',                            ref: 'Jeremías 29:11' },
  { texto: 'Estad quietos y conoced que yo soy Dios.',                                                                                             ref: 'Salmos 46:10' },
  { texto: 'El amor nunca deja de ser.',                                                                                                           ref: '1 Corintios 13:8' },
  { texto: 'Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.',                                       ref: 'Mateo 6:33' },
  { texto: 'El Señor está cerca de los quebrantados de corazón, y salva a los de espíritu abatido.',                                               ref: 'Salmos 34:18' },
  { texto: 'Así que la fe viene por el oír, y el oír por la Palabra de Dios.',                                                                     ref: 'Romanos 10:17' },
  { texto: 'Jehová peleará por vosotros, y vosotros estaréis tranquilos.',                                                                         ref: 'Éxodo 14:14' },
  { texto: 'No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo.',                                               ref: 'Isaías 41:10' },
  { texto: 'El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente.',                                                          ref: 'Salmos 91:1' },
  { texto: 'Porque donde están dos o tres congregados en mi nombre, allí estoy yo en medio de ellos.',                                             ref: 'Mateo 18:20' },
  { texto: 'Dios es nuestro refugio y fortaleza, nuestro pronto auxilio en las tribulaciones.',                                                     ref: 'Salmos 46:1' },
  { texto: 'Sean gratas las palabras de mi boca y la meditación de mi corazón delante de ti, oh Jehová, roca mía y redentor mío.',                 ref: 'Salmos 19:14' },
  { texto: 'El corazón alegre constituye buen remedio.',                                                                                           ref: 'Proverbios 17:22' },
  { texto: 'Lámpara es a mis pies tu Palabra y lumbrera a mi camino.',                                                                             ref: 'Salmos 119:105' },
  { texto: 'Esperad en Jehová; esforzaos y aliéntese vuestro corazón; sí, esperad en Jehová.',                                                     ref: 'Salmos 27:14' },
  { texto: 'Regocijaos en el Señor siempre. Otra vez digo: ¡Regocijaos!',                                                                         ref: 'Filipenses 4:4' },
  { texto: 'Yo soy la resurrección y la vida; el que cree en mí, aunque esté muerto, vivirá.',                                                     ref: 'Juan 11:25' },
  { texto: 'Él sana a los quebrantados de corazón y venda sus heridas.',                                                                           ref: 'Salmos 147:3' },
  { texto: 'Porque el Señor tu Dios está en medio de ti, poderoso para salvar.',                                                                   ref: 'Sofonías 3:17' },
  { texto: 'Toda la gloria, toda la honra y todo el poder son del Señor.',                                                                         ref: 'Apocalipsis 5:13' },
  { texto: 'Porque Cristo es mi vida, y el morir es ganancia.',                                                                                    ref: 'Filipenses 1:21' },
]

const hoy = new Date()

const fechaHoy = computed(() =>
  hoy.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
)

// Rota por día del año para que cambie cada día
const diaDelAnio = Math.floor(
  (hoy - new Date(hoy.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
)
const verso = VERSOS[diaDelAnio % VERSOS.length]
</script>

<style scoped>
.verse-header {
  background: rgb(var(--v-theme-primary));
}
</style>
