import { styled } from "..";

//Estilização da página toda
export const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
//   justifyContent: 'center',
  minHeight: '100vh', /* Faz com que a página ocupe a tela toda, como
  sae fosse um Full Screen */
})

//Estilização do Header
export const Header = styled('header', {
  padding: '2rem 0',
  width: '100%',
  maxWidth: 1180,
  margin: '0 auto',
})