function bannerRow(bannerString, textString){

    if(bannerString.length < textString.length){
        return bannerString;
    }

    const bannerCenter = Math.floor(bannerString.length / 2);
    const textCenter = Math.floor(textString.length / 2);
    const cursorPos = bannerCenter - textCenter;

    const before = bannerString.slice(0, cursorPos);
    const after = bannerString.slice(cursorPos + textString.length);

    return before + textString + after;
}

module.exports = bannerRow