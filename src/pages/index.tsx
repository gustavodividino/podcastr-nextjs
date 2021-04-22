import {GetStaticProps} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '../services/api';
import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

import styles from './home.module.scss';

/**
* Tipagem dos Episodes
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
* Tipagem da props da Home
*/
type HomeProps = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
}

export default function Home({ latestEpisodes, allEpisodes } : HomeProps) {
  return (
    <div className={styles.homepage}>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {latestEpisodes.map((episode => {
            return(
              <li key={episode.id}>
                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button">
                  <img src="/play-green.svg" alt="Tocar episódio"></img>
                </button>
              </li>
            )
          }))}
        </ul>

      </section>
      <section className={styles.allEpisodes}>
          <h2> Todos os episódios </h2>
          <table cellSpacing={0}>
            <thead>
              <tr>
                <th></th>
                <th>Podcaster</th>
                <th>Integrantes</th>
                <th>Data</th>
                <th>Duração</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {allEpisodes.map(episode => {
                return(
                  <tr key={episode.id}>
                    <td style={{width: 72}}>
                      <Image 
                        width={120}
                        height={120}
                        src={episode.thumbnail}
                        alt={episode.title}
                        objectFit="cover"
                      />
                    </td>
                    <td>
                      <Link href={`/episodes/${episode.id}`}>
                        <a>{episode.title}</a>
                      </Link>
                      
                    </td>
                    <td>{episode.members}</td>
                    <td style={{ width: 90}}>{episode.publishedAt}</td>
                    <td>{episode.durationAsString}</td>
                    <td>
                      <button type="button">
                        <img src="/play-green.svg" alt="Tocar episódio" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
      </section>
    </div>
  )
}

  /**
   * Faz a chamada da API para pegar os dados do servidor
   * */
export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes',{
    params:{
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  /**
   * Faz a conversão dos dados que foram entregues pela API
   * Formatando no padrão que se espera receber no frontEnd
   * */
  const episodes = data.map(episode => {
    return{
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale:ptBR }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      description: episode.description,
      url: episode.file.url,
    }
  })

  //Pega somente os dois primeiros Episodes
  const latestEpisodes = episodes.slice(0,2);

  //Pega a partir do segundo todos os episodes
  const allEpisodes = episodes.slice(2, episodes.length);

    /**
   * Faz o retorno do conteudo do resultado da chamada da API
   * e após a formatação dos valores recebidos
   * e revalida a chamada a cada 8 horas
   * */
  return{
    props: {
      episodes,
      latestEpisodes,
      allEpisodes
    },
    revalidate: 60 * 60 * 8, //revalidar a cada 8 horas
  }
}