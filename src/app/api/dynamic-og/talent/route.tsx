import { ImageResponse } from 'next/og';

import { ASSET_URL } from '@/constants/ASSET_URL';
import { formatNumber, formatString, loadGoogleFont } from '@/utils/ogHelpers';
import { getURL } from '@/utils/validUrl';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const getParam = (name: any, processFn = (x: any) => x) =>
      searchParams.has(name) ? processFn(searchParams.get(name)) : null;

    const name = getParam('name', (x) => formatString(x, 24));
    const username = getParam('username', (x) => formatString(x, 28));
    const photo = getParam('photo', (x) => formatString(x, 100));

    const totalEarned = getParam('totalEarned', formatNumber);
    const submissionCount = getParam('submissionCount', formatNumber);
    const winnerCount = getParam('winnerCount', formatNumber);

    const skills = getParam('skills', (x) => JSON.parse(decodeURIComponent(x)));

    const allText = `${name || ''}${username || ''}${totalEarned || ''}${submissionCount || ''}${winnerCount || ''}Skills $ Total Earned Participated Won @${skills?.map((skill: { skills: string }) => skill.skills).join('')}`;

    const [interMedium, interSemiBold, interBold] = await Promise.all([
      loadGoogleFont('Inter:wght@500', allText),
      loadGoogleFont('Inter:wght@600', allText),
      loadGoogleFont('Inter:wght@700', allText),
    ]);

    return new ImageResponse(
      (
        <div
          style={{
            backgroundImage: `url(${ASSET_URL}/og/talent/bg.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '50px 50px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundColor: 'white',
              height: '100%',
              borderRadius: '15px',
              padding: '45px 60px 25px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '24px',
                }}
              >
                <img
                  style={{
                    width: '120px',
                    height: '120px',
                    objectFit: 'contain',
                    borderRadius: '120px',
                  }}
                  alt="pfp"
                  src={photo as string}
                />
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      fontSize: 46,
                      fontStyle: 'normal',
                      color: 'black',
                      lineHeight: 1.4,
                      whiteSpace: 'pre-wrap',
                      fontFamily: '"Bold"',
                    }}
                  >
                    {name}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      fontSize: 34,
                      fontStyle: 'normal',
                      color: '#64748B',
                      lineHeight: 1.4,
                      whiteSpace: 'pre-wrap',
                      fontFamily: '"SemiBold"',
                      marginTop: '-8px',
                    }}
                  >
                    @{username}
                  </div>
                </div>
              </div>

              <img
                src={`${getURL()}assets/logo.svg`}
                alt="nearn logo"
                style={{
                  width: '125px',
                  height: '32px',
                  objectFit: 'contain',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginLeft: '150px',
              }}
            >
              <p
                style={{
                  color: '#64748B',
                  fontFamily: 'Medium',
                  fontSize: '26px',
                }}
              >
                Skills
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {skills?.map((skill: { skills: string }) => (
                  <p
                    key={skills.skills}
                    style={{
                      color: '#475569',
                      fontFamily: 'Medium',
                      fontSize: '22px',
                      backgroundColor: '#F1F5F9',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      margin: '0px',
                    }}
                  >
                    {skill.skills}
                  </p>
                ))}
              </div>
              <hr
                style={{
                  width: '100%',
                  borderColor: '#CBD5E1',
                  borderWidth: '1px',
                  marginTop: '24px',
                  marginBottom: '24px',
                }}
              />
              <div style={{ display: 'flex', gap: '60px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <p
                    style={{
                      color: 'Black',
                      fontFamily: 'Medium',
                      fontSize: '28px',
                    }}
                  >
                    ${totalEarned}
                  </p>
                  <p
                    style={{
                      color: '#64748B',
                      fontFamily: 'Medium',
                      fontSize: '28px',
                      marginTop: '-12px',
                    }}
                  >
                    Total Earned
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <p
                    style={{
                      color: 'Black',
                      fontFamily: 'Medium',
                      fontSize: '28px',
                    }}
                  >
                    {submissionCount}
                  </p>
                  <p
                    style={{
                      color: '#64748B',
                      fontFamily: 'Medium',
                      fontSize: '28px',
                      marginTop: '-12px',
                    }}
                  >
                    Participated
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <p
                    style={{
                      color: 'Black',
                      fontFamily: 'Medium',
                      fontSize: '28px',
                    }}
                  >
                    {winnerCount}
                  </p>
                  <p
                    style={{
                      color: '#64748B',
                      fontFamily: 'Medium',
                      fontSize: '28px',
                      marginTop: '-12px',
                    }}
                  >
                    Won
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: 'Medium', data: interMedium, style: 'normal' },
          { name: 'SemiBold', data: interSemiBold, style: 'normal' },
          { name: 'Bold', data: interBold, style: 'normal' },
        ],
      },
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
