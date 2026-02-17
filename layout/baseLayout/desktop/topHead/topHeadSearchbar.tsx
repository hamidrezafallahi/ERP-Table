import React, { useState } from 'react';

import DebounceSearch from '@components/molecules/debounceSearch';

function TopHeadSearchbar() {
    const [searchPhrase,setSearchPhrase]=useState(null)

  return (
          <DebounceSearch searchPhrase={searchPhrase} setSearchPhrase={setSearchPhrase}/>
  )
}

export default TopHeadSearchbar