/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:17:28 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-13 16:26:45
 */
import {
  DECLARATION_REQUEST,
  DECLARATION_SUCCESS,
  DECLARATION_FAILURE,
  DECLARATION_SELECTED,
  DECLARATION_CLOSED,
  NEW_DECL_MODAL_CLOSED,
  NEW_DECL_MODAL_OPENED,
} from '../actions/declaration-actions';

function declarationsReducer(
  state = {
    isFetching: false,
    declarations: '',
    selectedDeclaration: '',
    newDeclaration: '',
    workView: false,
    newDeclarationModal: false,
  },
  action
) {
  switch (action.type) {
    case DECLARATION_REQUEST:
      return {
        ...state,
        isFetching: true,
        workView: true,
      };
    case DECLARATION_SUCCESS:
      return {
        ...state,
        isFetching: false,
        declarations: action.declarations,
      };
    case DECLARATION_FAILURE:
      return {
        ...state,
        isFetching: false,
      };
    case DECLARATION_SELECTED:
      return {
        ...state,
        selectedDeclaration: action.selectedDeclaration,
      };
    case DECLARATION_CLOSED:
      return {
        ...state,
        workView: false,
      };
    case NEW_DECL_MODAL_OPENED:
      return {
        ...state,
        newDeclarationModal: true,
      };
    case NEW_DECL_MODAL_CLOSED:
      return {
        ...state,
        newDeclarationModal: false,
      };
    default:
      return state;
  }
}

export default declarationsReducer;