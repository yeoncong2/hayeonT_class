// Tailwind가 클래스 이름을 찾을 수 있게 색 조합을 한곳에 적어 둡니다.
export const TONE = {
  pink: { bg: 'bg-pink', deep: 'bg-pink-deep', text: 'text-pink-deep', ring: 'ring-pink-deep/40', soft: 'bg-pink/40' },
  peach: { bg: 'bg-peach', deep: 'bg-peach-deep', text: 'text-peach-deep', ring: 'ring-peach-deep/40', soft: 'bg-peach/40' },
  butter: { bg: 'bg-butter', deep: 'bg-butter-deep', text: 'text-butter-deep', ring: 'ring-butter-deep/40', soft: 'bg-butter/40' },
  mint: { bg: 'bg-mint', deep: 'bg-mint-deep', text: 'text-mint-deep', ring: 'ring-mint-deep/40', soft: 'bg-mint/40' },
  sky: { bg: 'bg-sky', deep: 'bg-sky-deep', text: 'text-sky-deep', ring: 'ring-sky-deep/40', soft: 'bg-sky/40' },
  lilac: { bg: 'bg-lilac', deep: 'bg-lilac-deep', text: 'text-lilac-deep', ring: 'ring-lilac-deep/40', soft: 'bg-lilac/40' },
};

export const UNIT_TONES = ['pink', 'butter', 'mint', 'sky'];

export const AREA_TONE = {
  문학: 'pink',
  읽기: 'sky',
  쓰기: 'butter',
  '듣기·말하기': 'mint',
  문법: 'lilac',
  매체: 'peach',
};
