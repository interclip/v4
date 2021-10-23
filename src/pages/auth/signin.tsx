import { Layout } from '@components/Layout';
import { getProviders, signIn, getSession } from 'next-auth/react';
import useHover from '@utils/hooks/useHover';
import { useState } from 'react';
import { NextApiRequest } from 'next';
import { IS_PROD } from '../../lib/constants';
import Image from 'next/image';

const brandColors = {
  gitlab: '#fc6d26',
  discord: '#7289da',
  google: '#4285f4',
  github: '#4078c0',
  apple: '#000000',
};

function changeBrightness(color: string, luminosity: number) {
  color = new String(color).replace(/[^0-9a-f]/gi, '');
  if (color.length < 6) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }
  luminosity = luminosity || 0;

  let newColor = '#',
    c,
    i,
    black = 0,
    white = 255;
  for (i = 0; i < 3; i++) {
    c = parseInt(color.substr(i * 2, 2), 16);
    c = Math.round(
      Math.min(Math.max(black, c + luminosity * white), white),
    ).toString(16);
    newColor += ('00' + c).substr(c.length);
  }
  return newColor;
}

export default function SignIn({ providers }: { providers: any }): JSX.Element {
  const [inputEmail, setEmail] = useState('');
  return (
    <Layout>
      <div className="w-full h-screen flex items-center justify-center">
        <div className="bg-gray-100 text-black w-96 h-auto rounded-lg pt-8 pb-8 px-8 flex flex-col items-center">
          <div className="mb-8">
            <Image
              src="/images/Interclip.svg"
              alt="Interclip's logo"
              width={128}
              height={128}
            />
          </div>
          {!IS_PROD && (
            <>
              <span className="mb-2">Log in with email (development only)</span>
              <input
                type="text"
                className="w-full h-12 rounded-lg px-4 text-lg focus:ring-blue-600 mb-4"
                autoComplete="email"
                placeholder="Your email"
                onChange={(e) => setEmail(e.target.value)}
                value={inputEmail}
              />
              <button
                className="w-full h-12 rounded-lg bg-light-bg text-gray-200 uppercase font-semibold hover:bg-blue-600 transition mb-4"
                onClick={() => signIn('credentials', { email: inputEmail })}
              >
                Login
              </button>
              <label className="text-gray-800 mb-4">or</label>
            </>
          )}
          {Object.values(providers).map((provider: any) => {
            const [hoverRef, isHovered] = useHover();
            return provider.id !== 'credentials' ? (
              <button
                className={`w-full h-12 rounded-lg text-white uppercase font-semibold transition mb-4 filter`}
                style={{
                  backgroundColor: changeBrightness(
                    // @ts-ignore
                    brandColors[provider.id],
                    !isHovered ? 0 : -0.15,
                  ),
                }}
                onClick={() => signIn(provider.id)}
                // @ts-ignore
                ref={hoverRef}
              >
                Sign in with {provider.name}
              </button>
            ) : (
              <></>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  const providers = await getProviders();
  const session = await getSession({ req });
  if (!session) {
    return {
      props: { providers },
    };
  } else {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
}
