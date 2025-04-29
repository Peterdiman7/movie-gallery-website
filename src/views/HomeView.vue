<template>
<div :class="extractCssClass('content-wrapper', $style)">
    <div class="pb-10">
        <AppTextInput v-model="filter" label="Looking for a movie..." type="text" input-text-color="white" />
    </div>
    <div :class="extractCssClass('content-wrapper__inner', $style)">
        <div v-for="movie in sortedMovies" :key="movie.id" :class="extractCssClass('card', $style)" @click="goToDetails(movie.id)">
            <img :class="extractCssClass('card__img', $style)" style="width: 300px; height: 300px; object-fit: cover;" :src="movie.imageUrl" :alt="movie.title" />
            <div>
                <span :class="extractCssClass('card__title', $style)">{{ movie.title }}</span>
            </div>
        </div>
    </div>
</div>
</template>

<script lang="ts">
export type Movie = {
    id: string
    title: string
    director: string
    genre: string
    releaseYear: number
    imageUrl: string
}
</script>

<script setup lang="ts">
import AppTextInput from '@/components/AppTextInput.vue'
import router from '@/router'
import { extractCssClass } from '@/utils'
import { computed, onMounted, ref } from 'vue'

const movies = ref<Array<Movie>>()
const filter = ref('')

const sortedMovies = computed(() => movies.value?.filter((movie) =>
    movie.title.toLowerCase().
        includes(filter.value.toLowerCase())))

const getMovies = async() => {
    const url = "http://localhost:4000/api/movies"

    fetch(url).
        then(res => res.json()).
        then(data => movies.value = data)
}

const goToDetails = (id: string) => {
    router.push({
        name: "details",
        params: {
            id,
        },
    })
}

onMounted(getMovies)
</script>

<style lang="scss" module>
@import "@/assets/styles/variables";
@import "@/assets/styles/global";
.content-wrapper {
    padding: 32px;

    &__inner {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;

        .card {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            &__title {
                @extend .font-family--clash-regular;
                color: rgb(214, 208, 144);
            }
            &__img {
                border-radius: 100%;
                &:hover {
                    cursor: pointer;
                    border-radius: 8px;
                    transition: .3s;
                }
            }
        }
    }
}
</style>