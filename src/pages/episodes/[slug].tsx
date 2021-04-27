import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Image from 'next/image'
import Head from 'next/head'
import Link from 'next/link';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import styles from './episode.module.scss';
import { usePlayer } from '../../context/PlayerContext';

/**
* Tipagem dos Episode
*/
type Episode = {
  id: string,
  title: string,
  thumbnail: string,
  members: string,
  publishedAt: string,
  duration: number,
  durationAsString: string,
  description: string,
  url: string,
}

/**
* Tipagem da props do Episode
*/
type EpisodeProps = {
  episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {
  const { play } = usePlayer();

  const router = useRouter();

  return (
    <div className={styles.episode}>

      <Head>
        <title>{episode.title} | Podcastr </title>
      </Head>

      <div className={styles.thumbnailContainer}>
        <Link href="/" >
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar"></img>
          </button>
        </Link>

        <Image
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit="cover"
        />
        <button type="button" onClick={() => play(episode)}>
          <img src="/play.svg" alt="Tocar episódio"></img>
        </button>
      </div>
      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }} //Força a execucao do codigo HTML
      />

    </div>
  )
}

/*
  Obrigatorio para todas as rotas que tem geração estática e parametros dinamicos
*/
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params;

  const { data } = await api.get(`/episodes/${slug}`)

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,
  }

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24, // 24 horas
  }
}