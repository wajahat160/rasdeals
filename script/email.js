// JavaScript Document

//<!--

function mailme()
{
ul=document.location.href;
pth1=ul.split("/");
if(ul.indexOf(".html")!=-1)
{
pth2=pth1[pth1.length-1];
}else
{
pth2=pth1[pth1.length-2];
}
//alert(pth2);
document.location.href="mailto:info@rasdeals.com,info@rasdeals.com?subject=Mail Through rasdeals from "+pth2+" page";
}
// -->