import { useTranslations } from 'next-intl';

import { QuestionIcon } from '@components/atoms/iconComponents';

import CircularButton from './circularButton';

function Helper() {
  const t = useTranslations();
  const getStatusText = (count) => {
    switch (count) {
      case 0:
        return <>{t("general.inAccessibility")}</>;
      case 1:
        return <>{t("general.onlyYourself")}</>;
      case 2:
        return <> {t("general.subCategory")}</>;
      case 3:
        return <>{t("general.roleCompanies")}</>;
      case 4:
        return <>{t("general.total")}</>;
    }
  };
  return (
    <div className='flex items-center gap-10 w-full h-10'>
      <QuestionIcon config={{width:24 , height:24 }}/>
      {[0,1,2,3,4].map((item,index)=>(<div key={index} className='flex items-center gap-1'>
      <CircularButton handleChange={(e)=>{console.log(e)}} preState={item}  disabled className='!cursor-default'/>
      <div className="text-gray-700 text-center">
        {getStatusText(item)}
      </div>
      </div>))}
    </div>
  );
}

export default Helper;
