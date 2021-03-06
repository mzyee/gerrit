/**
 * @license
 * Copyright (C) 2018 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import '../../../test/common-test-setup-karma.js';
import './gr-edit-preferences.js';

const basicFixture = fixtureFromElement('gr-edit-preferences');

suite('gr-edit-preferences tests', () => {
  let element;

  let editPreferences;

  function valueOf(title, fieldsetid) {
    const sections = element.$[fieldsetid].querySelectorAll('section');
    let titleEl;
    for (let i = 0; i < sections.length; i++) {
      titleEl = sections[i].querySelector('.title');
      if (titleEl.textContent.trim() === title) {
        return sections[i].querySelector('.value');
      }
    }
  }

  setup(() => {
    editPreferences = {
      auto_close_brackets: false,
      cursor_blink_rate: 0,
      hide_line_numbers: false,
      hide_top_menu: false,
      indent_unit: 2,
      indent_with_tabs: false,
      key_map_type: 'DEFAULT',
      line_length: 100,
      line_wrapping: false,
      match_brackets: true,
      show_base: false,
      show_tabs: true,
      show_whitespace_errors: true,
      syntax_highlighting: true,
      tab_size: 8,
      theme: 'DEFAULT',
    };

    stub('gr-rest-api-interface', {
      getEditPreferences() {
        return Promise.resolve(editPreferences);
      },
    });

    element = basicFixture.instantiate();

    return element.loadData();
  });

  test('renders', () => {
    // Rendered with the expected preferences selected.
    assert.equal(valueOf('Tab width', 'editPreferences')
        .firstElementChild.bindValue, editPreferences.tab_size);
    assert.equal(valueOf('Columns', 'editPreferences')
        .firstElementChild.bindValue, editPreferences.line_length);
    assert.equal(valueOf('Indent unit', 'editPreferences')
        .firstElementChild.bindValue, editPreferences.indent_unit);
    assert.equal(valueOf('Syntax highlighting', 'editPreferences')
        .firstElementChild.checked, editPreferences.syntax_highlighting);
    assert.equal(valueOf('Show tabs', 'editPreferences')
        .firstElementChild.checked, editPreferences.show_tabs);
    assert.equal(valueOf('Match brackets', 'editPreferences')
        .firstElementChild.checked, editPreferences.match_brackets);
    assert.equal(valueOf('Line wrapping', 'editPreferences')
        .firstElementChild.checked, editPreferences.line_wrapping);
    assert.equal(valueOf('Indent with tabs', 'editPreferences')
        .firstElementChild.checked, editPreferences.indent_with_tabs);
    assert.equal(valueOf('Auto close brackets', 'editPreferences')
        .firstElementChild.checked, editPreferences.auto_close_brackets);

    assert.isFalse(element.hasUnsavedChanges);
  });

  test('save changes', () => {
    sinon.stub(element.$.restAPI, 'saveEditPreferences')
        .returns(Promise.resolve());
    const showTabsCheckbox = valueOf('Show tabs', 'editPreferences')
        .firstElementChild;
    showTabsCheckbox.checked = false;
    element._handleEditShowTabsChanged();

    assert.isTrue(element.hasUnsavedChanges);

    // Save the change.
    return element.save().then(() => {
      assert.isFalse(element.hasUnsavedChanges);
    });
  });
});

