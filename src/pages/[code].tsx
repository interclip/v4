import { QRIcon } from '@components/Icons';
import { Layout } from '@components/Layout';
import QRModal from '@components/shared/QRModal';
import Link from '@components/Text/link';
import {
  getLinkPreviewFromCache,
  storeLinkPreviewInCache,
} from '@utils/clipPreview';
import getBestFavicon from '@utils/highestResolutionFavicon';
import { proxied } from '@utils/image';
import { db } from '@utils/prisma';
import { NextApiRequest } from 'next';
import Image from 'next/image';
import React, { useState } from 'react';
import { OEmbed } from 'src/typings/interclip';

const Redirect = ({
  code,
  url,
  oembed,
}: {
  code: string;
  url: string;
  oembed: OEmbed;
}) => {
  const [qrCodeZoom, setQrCodeZoom] = useState<boolean>(false);
  const urlObject = new URL(url);
  const simplifiedURL = `${urlObject.hostname}${urlObject.pathname}`;
  return (
    <Layout>
      <section className="h-full my-auto">
        <div className="flex p-4 mb-8 text-black bg-white rounded-2xl dark:text-white dark:bg-[#262A2B] shadow-custom">
          <div className="">
            <Image
              alt="Social preview image"
              src={proxied(
                'https://opengraph.githubassets.com/00c3274228fa5ac12295ba4d6a3ca5881adf682ab038d8988f1713099c7ecc28/interclip/interclip-next',
                1200,
                600,
              )}
              width={600}
              className="rounded-xl"
              height={300}
            />
            <h2 className="mt-2 mb-2 text-2xl max-w-[40rem]">
              {oembed.title || code}
            </h2>
            <h3 className="text-xl text-gray-400">
              <Link className="no-underline" href={url}>
                {simplifiedURL}
              </Link>
            </h3>
          </div>
          <div className="flex flex-col items-center">
            {oembed.favicons.length > 0 && (
              <Image
                src={`${proxied(getBestFavicon(oembed.favicons)!, 300, 300)}}`}
                alt="The site's favicon"
                className="rounded"
                width={72}
                height={72}
              />
            )}
            <QRIcon
              onClick={() => {
                setQrCodeZoom(true);
              }}
            />
          </div>
          {qrCodeZoom && <QRModal url={url} setQrCodeZoom={setQrCodeZoom} />}
        </div>
      </section>
    </Layout>
  );
};

export async function getServerSideProps({
  query,
}: {
  query: NextApiRequest['query'];
}) {
  const userCode = query.code;
  const isPreviewPage = userCode.indexOf('+') === userCode.length - 1;
  if (userCode && typeof userCode === 'object') {
    return { notFound: true };
  }

  if (isPreviewPage) {
    try {
      const selectedClip = await db.clip.findFirst({
        where: {
          code: {
            startsWith: userCode.slice(0, -1),
          },
        },
      });

      if (!selectedClip) {
        return { notFound: true };
      }
      const additionalDetails =
        (await getLinkPreviewFromCache(selectedClip.url)) ||
        (await storeLinkPreviewInCache(selectedClip.url));

      return {
        props: {
          code: selectedClip.code,
          url: selectedClip.url,
          oembed: {
            title: additionalDetails?.title || null,
            description: additionalDetails?.description || null,
            favicons: additionalDetails?.favicons,
          },
        },
      };
    } catch (e) {
      console.error(e);
      return {
        notFound: true,
      };
    }
  }

  try {
    const selectedClip = await db.clip.findUnique({
      where: { code: userCode },
    });
    if (!selectedClip) {
      return { notFound: true };
    }
    return {
      redirect: {
        destination: selectedClip.url,
        permanent: true,
      },
    };
  } catch (e) {
    return {
      notFound: true,
    };
  }
}

export default Redirect;
