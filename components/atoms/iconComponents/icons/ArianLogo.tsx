import Image from 'next/image';

import arianLogoRoute from '@public/arianTechLogo.png';

export const ArianLogo = () => {
  return <Image
  priority
  src={arianLogoRoute}
  alt="arian logo"
  width={39}
  height={29}
  style={{ height: "29px", width: "39px" }}
/>
};
