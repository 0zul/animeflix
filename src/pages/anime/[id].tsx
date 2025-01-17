import { EmojiSadIcon } from '@heroicons/react/solid';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import Banner from '@components/anime/Banner';
import EpisodeSection from '@components/anime/EpisodeSection';
import Section from '@components/anime/Section';
import Header from '@components/Header';
import { EpisodesListFragment } from '@generated/kitsu';
import { animePage, getKitsuEpisodes } from '@lib/api';
import { progress } from '@pages/_app';
import { AnimeBannerFragment, AnimeInfoFragment } from 'src/generated/aniList';

interface AnimeProps {
  anime: AnimeInfoFragment & AnimeBannerFragment;
  recommended: AnimeInfoFragment[];
  episodes: EpisodesListFragment;
}

export const getServerSideProps: GetServerSideProps<AnimeProps> = async (
  context
) => {
  let { id } = context.params;

  id = typeof id === 'string' ? id : id.join(' ');

  const data = await animePage({
    id: parseInt(id, 10),
    perPage: 12,
  });

  if (!data.Media) {
    return {
      notFound: true,
    };
  }

  // fetch episode list
  const { title, startDate, season } = data.Media;
  const english = getKitsuEpisodes(title.english, season, startDate.year);
  const romaji = getKitsuEpisodes(title.romaji, season, startDate.year);
  const episodes = await Promise.all([english, romaji]).then((r) => {
    return r[0].episodeCount > 0 ? r[0] : r[1];
  });

  return {
    props: {
      anime: data.Media,
      recommended: data.recommended.recommendations.map(
        (r) => r.mediaRecommendation
      ),
      episodes,
    },
  };
};

const Anime = ({
  anime,
  recommended,
  episodes,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <>
      <Header />
      <Banner anime={anime} onLoadingComplete={progress.finish} />

      {/* Don't show episode section if format is movie */}
      {anime.format !== 'MOVIE' && episodes.episodeCount > 0 && (
        <EpisodeSection anime={anime} episodes={episodes} />
      )}

      {anime.format !== 'MOVIE' && episodes.episodeCount === 0 && (
        <p className="flex items-center justify-center font-semibold text-white mt-4 ml-3 sm:ml-6 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl">
          no episodes found
          <EmojiSadIcon className="w-8" />
        </p>
      )}

      {recommended.length > 0 ? (
        <Section animeList={recommended} title="Recommended" />
      ) : (
        <p className="flex items-center justify-center font-semibold text-white mt-4 ml-3 sm:ml-6 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl">
          no recommendations found
          <EmojiSadIcon className="w-8" />
        </p>
      )}
    </>
  );
};

export default Anime;
