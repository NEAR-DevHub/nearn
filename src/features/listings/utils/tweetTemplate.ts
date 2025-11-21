import { PROJECT_NAME } from '@/constants/project';

export function tweetTemplate(url: string, type: string = 'bounty') {
  let noun = 'winners';
  if (type === 'sponsorship') noun = 'selected submissions';
  if (type === 'project') noun = 'hired talent';

  return `The results of this latest @${PROJECT_NAME} listing are out. Congratulations to the ${noun}👏

${url}
`;
}
