import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

/**
 * A component that teleports its children to the footer element in App.jsx.
 */
function FooterPortal({ children }) {
  // Find the portal's destination element.
  const portalRoot = document.getElementById('footer-portal-root');
  
  // If the element exists, create a portal. Otherwise, render nothing.
  return portalRoot ? createPortal(children, portalRoot) : null;
}

FooterPortal.propTypes = {
  children: PropTypes.node.isRequired,
};

export default FooterPortal;