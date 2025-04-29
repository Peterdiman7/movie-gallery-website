<template>
<div :class="extractCssClass('content-wrapper', $style)">
    <div :class="extractCssClass('movie-card', $style)">
        <img style="width: 500px;" :src="movie?.imageUrl" :alt="movie?.title" />
        <AppButton style="background-color: greenyellow; width: 500px;" variant="primary" :radius="8"
                   @click="openEditForm">
            Edit
        </AppButton>
        <AppButton style="background-color: tomato; width: 500px;" variant="primary" :radius="8"
                   @click="deleteMovie">
            Delete
        </AppButton>
        <div v-if="movieUpdateFormOpen">
            <div class="d-flex align-center flex-column gap-5">
                <span :class="extractCssClass('annotation', $style)">You can update the movie here:</span>
                <AppTextInput v-model="title" :class="extractCssClass('input', $style)" label="Title" type="text" />
                <AppTextInput v-model="director" :class="extractCssClass('input', $style)" input-text-color="white"
                              label="Director" type="text" />
                <AppTextInput v-model="genre" :class="extractCssClass('input', $style)" input-text-color="white"
                              label="Genre" type="text" />
                <AppTextInput v-model="releaseYear" :class="extractCssClass('input', $style)"
                              input-text-color="white" label="Release Year" type="text" />
                <AppTextInput v-model="imageUrl" :class="extractCssClass('input', $style)" input-text-color="white"
                              label="Image Url" type="text" />
                <AppButton variant="primary" :radius="8" :class="extractCssClass('input', $style)"
                           @click="editMovie">
                    Submit
                </AppButton>
            </div>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Movie } from './HomeView.vue';
import { extractCssClass } from '@/utils';
import AppButton from '@/components/AppButton.vue';
import AppTextInput from '@/components/AppTextInput.vue';

const router = useRouter()

const paramsId = computed(() => router.currentRoute.value.params.id)

const movie = ref<Movie>()
const movieUpdateFormOpen = ref<boolean>(false)

const title = ref("")
const director = ref("")
const genre = ref("")
const releaseYear = ref("")
const imageUrl = ref("")

const openEditForm = () => {
    movieUpdateFormOpen.value = !movieUpdateFormOpen.value
}

const editMovie = async () => {
    const url = `http://localhost:4000/api/movies/${paramsId.value}`

    const movieData = {
        title: title.value ? title.value : movie.value?.title,
        director: director.value ? director.value : movie.value?.director,
        genre: genre.value ? genre.value : movie.value?.genre,
        releaseYear: releaseYear.value ? releaseYear.value : movie.value?.releaseYear,
        imageUrl: imageUrl.value ? imageUrl.value : movie.value?.imageUrl,
    }


    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json',
        },
        body: JSON.stringify(movieData),
    })
    if (!response.ok) {
        throw new Error('Failed to update the movie');
    } else {
        await response.json()

        movieUpdateFormOpen.value = false

        title.value = ''
        director.value = ''
        genre.value = ''
        releaseYear.value = ''
        imageUrl.value = ''
    }
}

const deleteMovie = async () => {
    const url = `http://localhost:4000/api/movies/${paramsId.value}`

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error('Failed to update the movie');
    } else {
        await response.json()
        router.push({ name: 'home' })
    }
}

const getMovieDetails = async () => {
    const url = `http://localhost:4000/api/movies/${paramsId.value}`

    fetch(url).
        then(res => res.json()).
        then(data => movie.value = data)
}

onMounted(getMovieDetails)
</script>

<style lang="scss" module>
@import "../assets/styles/variables.scss";
@import "../assets/styles/global.scss";

.content-wrapper {
    padding: 32px 0;

    .movie-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;

        .annotation {
            @extend .font-family--inter-light;
        }

        .input {
            width: 500px;
        }
    }
}
</style>