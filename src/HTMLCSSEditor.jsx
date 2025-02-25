import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, Modal } from "react-bootstrap";
import CodeMirror from "@uiw/react-codemirror";
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { BarLoader, SyncLoader, MoonLoader, ClimbingBoxLoader } from 'react-spinners';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCircleXmark, faExpand, faCircleInfo, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { EditorView } from '@codemirror/view';
import QuestionList from "./QuestionList";
import Header from "./Header";
 
const HTMLCSSEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const questionData = location.state?.questionData[0];
  const completeData = location.state?.questionData;
  const [duration, setDuration] = useState(60);
  const [htmlEdit, setHtmlEdit] = useState(questionData?.Template || '');
  const [cssEdit, setCssEdit] = useState('');
  const [activeTab, setActiveTab] = useState('html');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [displ, setdispl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [validationStatus, setValidationStatus] = useState({ html: [], css: [] });
  const [splitOffset, setSplitOffset] = useState(window.innerWidth / 2);
  const [isDragging, setIsDragging] = useState(false);
  const [initialX, setInitialX] = useState(null);
  const [editorHeightPercentage, setEditorHeightPercentage] = useState(45);
  const [outputHeightPercentage, setOutputHeightPercentage] = useState(45);
  const [isDraggingVertically, setIsDraggingVertically] = useState(false);
  const [initialY, setInitialY] = useState(null);
  const [DOMSTR, setDOMSTR] = useState('HTML DOM structure');
  const [DOMTRUE, setDOMTRUE] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSkipConfirmation, setSkipConfirmation] = useState(false);
  const [submitData, setSubmitData] = useState("Submit");
  const [backupEnabledHTML, setBackupEnabledHTML] = useState(true);
  const [backupEnabledCSS, setBackupEnabledCSS] = useState(true);
  const [isSubmittedHTML, setIsSubmittedHTML] = useState(false);
  const [isSubmittedCSS, setIsSubmittedCSS] = useState(false);
  const [answerSubmitted,setAnswerSubmitted] = useState(false)

 
  useEffect(() => {
    if (!questionData) {
      navigate("/"); 
    } else {
      const storedHtmlCode = sessionStorage.getItem("HTMLUserAnswer");
      const storedCssCode = sessionStorage.getItem("CSSUserAnswer");
 
      if (storedHtmlCode) {
        setHtmlEdit(storedHtmlCode);
      }
 
      if (storedCssCode) {
        setCssEdit(storedCssCode);
      }
 
      // Check if the user has already submitted answers
      // if (questionData.User_HTML_ans) {
      //   setHtmlEdit(questionData.User_HTML_ans);
      //   setIsSubmittedHTML(true);
      // }
      // else{}
 
      // if (questionData.User_CSS_ans) {
      //   setCssEdit(questionData.User_CSS_ans);
      //   setIsSubmittedCSS(true);
      // }
    }
  }, [questionData, navigate]);

  useEffect(() => {
    const trigger = async () => {
      try {
        const response = await axios.post(
          "https://thoughtprocesstestbackend.azurewebsites.net/stat/",
          {
            UID: sessionStorage.getItem('UID')
          }
        );
        if(response.data.status === "Completed"){
          navigate('/ThankYou');
        }
        if (response.data.status.HTML === true) {
          setBackupEnabledCSS(false);
          setIsSubmittedCSS(true);
          setSubmitData("Submitted");
          setAnswerSubmitted(true)
        }
      } catch (error) {
        console.error("Error fetching the data:", error);
      } finally {
        setLoading(false);
      }
    }
    trigger();
  }, []);
 
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setInitialX(e.clientX);
  };
 
 
  const handleMouseMove = (e) => {
    if (!isDragging || !initialX) return;
    const dx = e.clientX - initialX;
    setSplitOffset(splitOffset + dx);
    setInitialX(e.clientX);
  };
 
  const handleMouseUp = () => {
    setIsDragging(false);
    setInitialX(null);
  };
 
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
 
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, initialX]);
 
  const handleVerticalMouseDown = (e) => {
    setIsDraggingVertically(true);
    setInitialY(e.clientY);
  };
 
  const handleVerticalMouseMove = (e) => {
    if (!isDraggingVertically || !initialY) return;
    const dy = e.clientY - initialY;
    const vhUnitChange = (dy / window.innerHeight) * 100;
 
    setEditorHeightPercentage((prevHeight) => {
      const newHeight = Math.max(30, Math.min(70, prevHeight + vhUnitChange));
      setOutputHeightPercentage(94 - newHeight);
      return newHeight;
    });
 
    setInitialY(e.clientY);
  };
 
  const handleVerticalMouseUp = () => {
    setIsDraggingVertically(false);
    setInitialY(null);
  };
 
  useEffect(() => {
    window.addEventListener('mousemove', handleVerticalMouseMove);
    window.addEventListener('mouseup', handleVerticalMouseUp);
 
    return () => {
      window.removeEventListener('mousemove', handleVerticalMouseMove);
      window.removeEventListener('mouseup', handleVerticalMouseUp);
    };
  }, [isDraggingVertically, initialY]);
 
  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
  };
 
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
 
  const handleCloseAlert = () => {
    setShowAlert(false);
    setdispl('');
  };
 
  const handleImgView = () => {
    setdispl('image');
    setShowAlert(true);
  };
 
  const Handlepreview = () => {
    setdispl('output');
    setShowAlert(true);
  };
 
  useEffect(() => {
    if (backupEnabledHTML) {
      console.log("dfdfudsfkjdsf")
      const intervalHTML = setInterval(() => backupCode('html'), 120000/4);
      return () => clearInterval(intervalHTML);
    }
  }, [htmlEdit, cssEdit, backupEnabledHTML]);
  
  const backupCode = async (subject) => {
    if ((subject === 'HTML' && !backupEnabledHTML) || (subject === 'CSS' && !backupEnabledCSS)) return;

    try {
      const response1 = await axios.post(
        `https://thoughtprocesstestbackend.azurewebsites.net/code/backup/`,
        {
          UID: sessionStorage.getItem('UID'),
          Subject: "HTML",
          Qn: questionData.Qn_name,
          code: htmlEdit
        }
      );

      const response2 = await axios.post(
        `https://thoughtprocesstestbackend.azurewebsites.net/code/backup/`,
        {
          UID: sessionStorage.getItem('UID'),
          Subject: "CSS",
          Qn: questionData.Qn_name,
          code: cssEdit 
        }
      );

      if (response1.data.status === "Already submitted") {
        if (subject === 'html') {
          setBackupEnabledHTML(false);
          setIsSubmittedHTML(true);
        } 
        // if (subject === 'css') {
        //   setBackupEnabledCSS(false);
        //   setIsSubmittedCSS(true);
        // }
        setSubmitData("Submitted");
        setIsSubmittedHTML(true);

      }
    } catch (error) {
      console.error("Error fetching the data:", error);
    } finally {
      setLoading(false);
    }
  }

  const onChangeHtml = useCallback((value, viewUpdate) => {
    setHtmlEdit(value);
    sessionStorage.setItem("HTMLUserAnswer", value);
    handleCheckCode('html', value); 
  }, [questionData.Qn_name]);
 
  const onChangeCss = useCallback((value, viewUpdate) => {
    setCssEdit(value);
    sessionStorage.setItem('CSSUserAnswer', value);
    handleCheckCode('css', value); 
  }, [questionData.Qn_name]);
 
  const handleCheckCode = (type, code) => {
    if (!questionData) {
      return;
    }
 
    const htmlValidationData = questionData.Code_Validation.HTML;
    const cssValidationData = questionData.Code_Validation.CSS;
    let presentIndices;
 
    if (type === 'html') {
      const extractAttributes = (html) => {
        const tagMatches = [...html.matchAll(/<(\w+)([^>]*)>/g)].map(match => {
          const attributes = {};
          const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
          const attributeMatches = [...match[2].matchAll(/(\w+)\s*=\s*["']([^"']*)["']/g)];
 
          attributeMatches.forEach(attrMatch => {
            const attrName = attrMatch[1];
            let attrValue = attrMatch[2];
 
            if (['href', 'src', 'data-url', 'url'].includes(attrName)) {
              const fullMatch = match[2].match(new RegExp(`${attrName}\\s*=\\s*["']([^"']*\\{\\{\\s*url_for\\s*\\([^\\)]+\\)\\s*[^"']*)["']`));
              if (fullMatch) {
                attrValue = fullMatch[1];
              }
            }
 
            if (!attributes[attrName]) {
              attributes[attrName] = [];
            }
            attributes[attrName].push(attrValue);
          });
 
          return {
            tag: match[1],
            attributes,
            isSelfClosing: selfClosingTags.includes(match[1].toLowerCase()),
            hasClosingTag: !selfClosingTags.includes(match[1].toLowerCase()) && new RegExp(`</${match[1]}>`).test(html)
          };
        });
        return tagMatches;
      };
 
      const normalizedAttributes = extractAttributes(code);
 
      const relevantAttributes = ['type', 'id', 'name', 'required', 'class', 'url'];
 
      const missingHTMLValues = htmlValidationData.filter(expectedTag => {
        const foundTags = normalizedAttributes.filter(actualTag => actualTag.tag === expectedTag.tag);
        let isTagMissing = false;
 
        const hasMatchingTag = foundTags.some(foundTag => {
          const expectedAttributes = expectedTag.attributes;
          const actualAttributes = foundTag.attributes;
 
          if (!foundTag.isSelfClosing && !foundTag.hasClosingTag) {
            return false;
          }
 
          return Object.keys(expectedAttributes).every(attr => {
            const expectedValues = Array.isArray(expectedAttributes[attr]) ? expectedAttributes[attr] : [expectedAttributes[attr]];
            const actualValues = Array.isArray(actualAttributes[attr]) ? actualAttributes[attr] : [actualAttributes[attr]];
 
            if (!actualValues || actualValues.length === 0) {
              expectedTag.missingAttributes = expectedTag.missingAttributes || {};
              expectedTag.missingAttributes[attr] = expectedValues;
              return false;
            }
 
            const allValuesMatch = expectedValues.every((val) => (actualValues).includes(val));
            if (!allValuesMatch) {
              expectedTag.missingAttributes = expectedTag.missingAttributes || {};
              expectedTag.missingAttributes[attr] = expectedValues.filter((val) => !(actualValues).includes(val));
              return false;
            }
 
            return true;
          });
        });
 
        if (!hasMatchingTag) {
          isTagMissing = true;
        }
 
        return isTagMissing;
      }).map(tag => {
        if (tag.missingAttributes) {
        }
        return tag;
      });
 
      const isHTMLValid = missingHTMLValues.length === 0;
 
      presentIndices = htmlValidationData.map((item, index) => missingHTMLValues.includes(item) ? null : index).filter(index => index !== null);
      setValidationStatus(prevState => ({ ...prevState, html: presentIndices }));
 
      const validHTMLTags = [
        'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio',
        'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button',
        'canvas', 'caption', 'cite', 'code', 'col', 'colgroup',
        'data', 'datalist', 'dd', 'del', 'details', 'dialog', 'div',
        'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure',
        'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head',
        'header', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins',
        'kbd', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark',
        'meta', 'meta', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option',
        'output', 'p', 'param', 'picture', 'pre', 'progress', 'q',
        'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select',
        'small', 'source', 'span', 'strong', 'style', 'sub', 'summary',
        'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot',
        'th', 'thead', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video',
        'wbr'
      ];
 
      const validateHTML = (html) => {
        const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
        const headTags = ['title', 'meta', 'link', 'style', 'script'];
        const bodyTags = ['head', 'html', ...headTags];
        const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
        const nonSelfClosingTags = [
          'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo',
          'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col',
          'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dialog', 'div', 'dl', 'dt',
          'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2',
          'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html', 'i', 'iframe', 'img',
          'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark',
          'menu', 'menuitem', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup',
          'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt',
          'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span',
          'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template',
          'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul',
          'var', 'video', 'wbr'
        ];
 
        const HtmlTags = ['html', 'head', 'body'];
 
        const doctypeContent = html.match(/<!DOCTYPE html[^>]*>([\s\S]*?)<\/html>/);
        const htmlContent = html.match(/<html[^>]*>([\s\S]*?)<\/html>/);
        const headContent = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
        const bodyContent = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
 
        const isValidTag = (tagName) => validHTMLTags.includes(tagName);
        if (htmlContent == null) {
          setDOMSTR('Invalid DOM structure');
          setDOMTRUE(true);
          return false;
        } else {
          if (doctypeContent) {
            const docMatches = doctypeContent[1].match(tagPattern);
            for (let tag of docMatches || []) {
              const tagName = tag.replace(/<\/?|\/?>/g, '').split(' ')[0].toLowerCase();
              if (HtmlTags.includes(tagName) || !isValidTag(tagName)) {
                // Handle any invalid tags found
              }
            }
            setDOMSTR('HTML DOM structure');
            setDOMTRUE(false);
          }
 
          if (htmlContent) {
            const htmlMatches = htmlContent[1].match(tagPattern);
            for (let tag of htmlMatches || []) {
              const tagName = tag.replace(/<\/?|\/?>/g, '').split(' ')[0].toLowerCase();
              if (!isValidTag(tagName)) {
                setDOMSTR(`Invalid ${tagName} tag inside html tag due to possible spelling error`);
                setDOMTRUE(true);
                return false;
              }
            }
            setDOMSTR('HTML DOM structure');
            setDOMTRUE(false);
          }
 
          if (headContent) {
            const headMatches = headContent[1].match(tagPattern);
            for (let tag of headMatches || []) {
              const tagName = tag.replace(/<\/?|\/?>/g, '').split(' ')[0].toLowerCase();
              if (!headTags.includes(tagName) || !isValidTag(tagName)) {
                setDOMSTR(`Invalid ${tagName} tag inside head tag`);
                setDOMTRUE(true);
                return false;
              }
            }
            setDOMSTR('HTML DOM structure');
            setDOMTRUE(false);
          }
 
          // Check if body exists
          if (!bodyContent || bodyContent[1].trim() === '') {
            return false;
          }
 
          // Validate body tags
          const bodyMatches = bodyContent[1].match(tagPattern);
          for (let tag of bodyMatches || []) {
            const tagName = tag.replace(/<\/?|\/?>/g, '').split(' ')[0].toLowerCase();
            if (bodyTags.includes(tagName) || !isValidTag(tagName)) {
              setDOMSTR(`Invalid ${tagName} tag inside body tag`);
              setDOMTRUE(true);
              return false;
            }
            setDOMSTR('HTML DOM structure');
            setDOMTRUE(false);
          }
 
          // Validate self-closing tags
          const selfClosingMatches = bodyContent[1].match(/<([a-z][a-z0-9]*)\s*\/?>/gi);
          for (let tag of selfClosingMatches || []) {
            const tagName = tag.replace(/<\/?|\/?>/g, '').toLowerCase();
            if (selfClosingTags.includes(tagName)) {
              setDOMSTR(`Invalid self-closing tag: ${tagName}`);
              setDOMTRUE(true);
              return false;
            } else {
              if (!nonSelfClosingTags.includes(tagName)) {
                setDOMSTR(`Invalid non-self-closing tag: ${tagName}`);
                setDOMTRUE(true);
                return false;
              }
            }
          }
 
          setDOMSTR('HTML DOM structure');
          setDOMTRUE(false);
          return true;
        }
      };
 
      const isHeadAndBodyValid = validateHTML(code);
 
      if (!isHTMLValid) {
      } else {
        if (isHeadAndBodyValid) {
        } else {
        }
      }
 
      presentIndices = htmlValidationData.map((item, index) => missingHTMLValues.includes(item) ? null : index).filter(index => index !== null);
      setValidationStatus(prevState => ({ ...prevState, html: presentIndices }));
    } else if (type === 'css') {
      if (typeof code !== 'string') {
        return;
      }
 
      const validateRules = (rules, blocks) => {
        return rules.filter(expectedRule => {
          const foundRule = blocks.find(block => {
            const selector = block.split('{')[0].trim();
            const properties = block.split('{')[1].split(';').map(prop => prop.trim()).filter(prop => prop !== '');
 
            if (selector !== expectedRule.selector) {
              return false;
            }
 
            return expectedRule.properties.every((expectedProp) => {
              const foundProp = properties.find(prop => {
                const property = prop.split(':')[0].trim();
                let value = prop.split(':')[1].trim();
 
                const finalvalue = value.toString().split('\n').map(line => line.replace(/\s*,\s*/g, ', ')).join('\n');
                return expectedProp.property === property && expectedProp.value === finalvalue;
              });
              return foundProp !== undefined;
            });
          });
          return !foundRule;
        });
      };
 
      const mediaQueryRegex = /@media[^{]+\{([\s\S]+?})\s*}/g;
      let match;
      const mediaQueryBlocks = [];
      while ((match = mediaQueryRegex.exec(code)) !== null) {
        mediaQueryBlocks.push(match[0]);
      }
 
      const normalCSS = code.replace(mediaQueryRegex, '');
      const normalBlocks = normalCSS.split('}').map(block => block.trim()).filter(block => block !== '');
 
      const missingCSSRules = validateRules(cssValidationData.filter(rule => !rule.media_query), normalBlocks);
 
      const missingMediaQueryRules = {};
      cssValidationData.filter(rule => rule.media_query).forEach(mediaQuery => {
        const mediaQueryBlock = mediaQueryBlocks.find(block => block.includes(mediaQuery.media_query));
        if (mediaQueryBlock) {
          const startIndex = mediaQueryBlock.indexOf('{') + 1;
          const endIndex = mediaQueryBlock.lastIndexOf('}');
          const mediaQueryContent = mediaQueryBlock.substring(startIndex, endIndex).trim();
 
          const blocks = mediaQueryContent.split('}').map(block => block.trim()).filter(block => block !== '');
 
          const missingRules = validateRules(mediaQuery.rules, blocks);
          if (missingRules.length > 0) {
            missingMediaQueryRules[mediaQuery.media_query] = missingRules;
          }
        } else {
          missingMediaQueryRules[mediaQuery.media_query] = mediaQuery.rules;
        }
      });
 
      const isCSSValid = missingCSSRules.length === 0 && Object.keys(missingMediaQueryRules).length === 0;
 
      presentIndices = cssValidationData.map((item, index) => {
        if (item.media_query) {
          return missingMediaQueryRules[item.media_query] ? null : index;
        }
        return missingCSSRules.includes(item) ? null : index;
      }).filter(index => index !== null);
 
      setValidationStatus(prevState => ({ ...prevState, css: presentIndices }));
    }
  };
 
  const sendDataToBackend = (type, code) => {
    setLoading(true);
    const subjectType = type.toUpperCase();
    const url = `https://thoughtprocesstestbackend.azurewebsites.net/${type}/`;
    const data = {
      UID: sessionStorage.getItem('UID'),
      Subject: subjectType,
      Qn: questionData.Qn_name,
      KEYS: type === 'html' ? questionData.Code_Validation.HTML : questionData.Code_Validation.CSS,
      Ans: code || '',
    };
 
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      console.log("Response from backend:", data);
    })
    .catch(error => {
      console.error('Error:', error);
    })
    .finally(() => {
      setLoading(false);
    });
 
    if (type === 'html') {
      sessionStorage.setItem("HTMLUserAnswer", code);
    } else {
      sessionStorage.setItem("CSSUserAnswer", code);
    }
  };
 
  const sendSkipDataToBackend = (type, code) => {
    setLoading(true);
    const subjectType = type.toUpperCase();
    const url = `https://thoughtprocesstestbackend.azurewebsites.net/${type}/`;
    const data = {
      UID: sessionStorage.getItem('UID'),
      Subject: subjectType,
      Qn: questionData.Qn_name,
      KEYS: type === 'html' ? questionData.Code_Validation.HTML : questionData.Code_Validation.CSS,
      Ans: '',
    };
 
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      console.log("Response from backend:", data);
    })
    .catch(error => {
      console.error('Error:', error);
    })
    .finally(() => {
      setLoading(false);
    });
 
    if (type === 'html') {
      sessionStorage.setItem("HTMLUserAnswer", '');
    } else {
      sessionStorage.setItem("CSSUserAnswer", '');
    }
  };
 
  const handleConfirmation = () => {
    setShowConfirmation(false);
    setSubmitData("Submitting");
    sendDataToBackend('html', htmlEdit);
    sendDataToBackend('css', cssEdit);
    setSubmitData("Submitted");
    setIsSubmittedHTML(true);
    setIsSubmittedCSS(true);
    setAnswerSubmitted(true);
  };
 
  const handlesubmit = () => {
    setShowConfirmation(true);
  };
 
  const handleskip = () => {
    setSkipConfirmation(true);
  };
 
  const handleSkipConfirmation = () => {
    setSkipConfirmation(false);
    sendSkipDataToBackend('html', htmlEdit);
    sendSkipDataToBackend('css', cssEdit);
    setIsSubmittedHTML(true);
    setIsSubmittedCSS(true);
  };
 
  const codeMirrorConfig = {
    theme: "light",
    height: "100%",
    style: {
      backgroundColor: 'white',
      overflow: 'auto'
    },
    basicSetup: {
      lineNumbers: true,
      foldGutter: true,
      highlightActiveLine: true,
    },
    extensions: [
      EditorView.lineWrapping,
      EditorView.theme({
        "&": {
          maxHeight: "100%"
        },
        ".cm-scroller": {
          overflow: "auto"
        },
        ".cm-line": {
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          lineHeight: "1.6em"
        }
      })
    ]
  };
 
  const renderEditor = () => {
    switch (activeTab) {
      case 'html':
        return (
          <CodeMirror
            className="text-xl text-start custom-codemirror"
            value={htmlEdit || sessionStorage.getItem("HTMLUserAnswer")}
            height="100%"
            extensions={[html(), ...codeMirrorConfig.extensions]}
            onChange={onChangeHtml}
            {...codeMirrorConfig}
          />
        );
      case 'css':
        return (
          <CodeMirror
            className="text-xl text-start custom-codemirror"
            value={cssEdit || (sessionStorage.getItem('CSSUserAnswer')) || ''}
            height="95%"
            theme="light"
            extensions={[css(), ...codeMirrorConfig.extensions]}
            onChange={onChangeCss}
            style={{ backgroundColor: 'white', overflow: 'auto' }}
            {...codeMirrorConfig}
          />
        );
      default:
        return null;
    }
  };
 
  const srcCode = `
    ${htmlEdit.replace('</body>', '').replace('</html>', '')}
    <style>${cssEdit}</style>
    </body>
    </html>
  `;
 
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f2eeee" }}>
        <MoonLoader color="black" loading={loading} size={40} />
      </div>
    );
  }
 
  return (
    <div className="d-flex flex-column vh-100">
      <Header />
      <div className="container-fluid flex-grow-1 py-3 overflow-hidden">
        <div className="row h-100 g-0">
          <QuestionList />
          <div className="col-5 lg-8" style={{ height: "100%" }}>
            <div className="border border-dark rounded-2 d-flex flex-column" style={{ height: "calc(100% - 5px)", backgroundColor: "#E5E5E533" }}>
              <div className="border-bottom border-dark p-3 d-flex justify-content-between align-items-center">
                <h5 className="m-0">Problem Statement</h5>
              </div>
              <div className="p-3 flex-grow-1 overflow-auto me-1">
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{questionData?.Qn}</pre>
                <div className='d-flex justify-content-start mt-3'>
                  <div className="btn btn-sm" style={{ backgroundColor: '#B8B7B7', color: '#000000' }}>
                    Expected output
                  </div>
                  <FontAwesomeIcon icon={faExpand} className='px-1 mt-2 text-dark' onClick={handleImgView} style={{ cursor: 'pointer' }} />
                </div>
                <img src={questionData?.Sample_img} className="img-fluid mt-3" alt="image" style={{ pointerEvents: 'none' }} />
                <div className='d-flex justify-content-start mt-3'>
                  <div className="btn btn-sm" style={{ backgroundColor: '#B8B7B7', color: '#000000' }}>
                    Requirements
                  </div>
                </div>
                <div className='mt-2' style={{ fontSize: '14px', maxHeight: '70vh'}}>
                  {(() => {
                    switch (activeTab) {
                      case 'html':
                        return (
                          <>
                            <span className='p-2 ' style={{ fontFamily: '"Segoe UI", Arial, sans-serif' }}>
                              {DOMTRUE ? (
                                <>
                                  <FontAwesomeIcon icon={faCircleXmark} className="mx-1 text-danger" />
                                  {DOMSTR}
                                </>
                              ) : (
                                <>
                                  <FontAwesomeIcon icon={faCheckCircle} className="mx-1 text-success" />
                                  {`HTML DOM structure`}
                                </>
                              )}
                            </span>
                            {questionData?.Code_Validation.HTML_Messages.map((message, index) => (
                              <div key={index} className='p-2'>
                                {validationStatus.html && validationStatus.html.includes(index) ? (
                                  <FontAwesomeIcon icon={faCheckCircle} className='mx-1 text-success' />
                                ) : (
                                  <FontAwesomeIcon icon={faCircleXmark} className='mx-1 text-danger' />
                                )}
                                {message}
                              </div>
                            ))}
                          </>
                        );
                      case 'css':
                        return (
                          <>
                            {questionData?.Code_Validation.CSS_Messages.map((message, index) => (
                              <div key={index} className='p-2'>
                                {validationStatus.css && validationStatus.css.includes(index) ? (
                                  <FontAwesomeIcon icon={faCheckCircle} className='mx-1 text-success' />
                                ) : (
                                  <FontAwesomeIcon icon={faCircleXmark} className='mx-1 text-danger' />
                                )}
                                {message}
                              </div>
                            ))}
                          </>
                        );
                      default:
                        return null;
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
 
          <div className="d-flex flex-column" style={{ flex: "1", height: "100%", marginLeft: "20px" }}>
            <div className="border border-dark rounded-2 me-3" style={{ height: "45%",  overflow: 'hidden' }}>
              <div className="border-bottom border-dark p-3 d-flex justify-content-between align-items-center">
                <div>
                  {questionData?.Tabs.map((tab, index) => (
                    <div
                      key={index}
                      style={{
                        width: '70px',
                        height: '30px',
                        borderRadius: '10px',
                        backgroundColor: activeTab === tab.toLowerCase() ? "black" : "transparent",
                        color: activeTab === tab.toLowerCase() ? "white" : "black",
                        border: activeTab === tab.toLowerCase() ? "none" : "1px solid black",
                        display: 'inline-block',
                        textAlign: 'center',
                        lineHeight: '30px',
                        marginRight: '8px',
                        cursor: 'pointer'
                      }}
                      className={`tab-button me-1 ${activeTab === tab.toLowerCase() ? 'selected-tab' : ''}`}
                      onClick={() => handleTabClick(tab.toLowerCase())}
                    >
                      {tab}
                    </div>
                  ))}
                </div>
              </div>
              <div className="col top" style={{ height: `calc(100% - 60px)`, overflowY: 'auto', marginBottom: '10px' }}>
                {renderEditor()}
              </div>
            </div>
 
            <div style={{ height: "9%", padding: "10px 0" }} className="d-flex flex-column justify-content-center me-3">
              <div className="d-flex justify-content-between align-items-center h-100">
                <div className="d-flex flex-column justify-content-center">
 
                </div>
                <div className="d-flex justify-content-end align-items-center">
                <Button
                  variant="light"
                  className="me-2 border border-dark"
                  onClick={handlesubmit}
                  style={{
                    backgroundColor: "#FBEFA5DB",
                    minWidth: "100px",
                    boxShadow: "1px 2px 1px #888"
                  }}
                  disabled={htmlEdit.trim().length === 0 || cssEdit.trim().length === 0 || answerSubmitted}
                >
                  {submitData.toUpperCase()}
              </Button>
                </div>
              </div>
            </div>
 
            <div className="border border-dark rounded-2 me-3" style={{ height: "45%", backgroundColor: "#E5E5E533", overflowY: 'auto' }}>
              <div className="border-bottom border-dark p-3 d-flex justify-content-between align-items-center">
                <h5 className="m-0">Output</h5>
              </div>
              <div className="p-3" style={{ height: "calc(100% - 58px)", overflow: 'auto' }}>
                <div className='d-flex justify-content-start mt-2'>
                  <div className="btn btn-sm" style={{ backgroundColor: '#B8B7B7', color: '#000000' }}>
                    Your Output
                  </div>
                  <FontAwesomeIcon icon={faExpand} className='px-1 mt-2' onClick={Handlepreview} style={{ cursor: 'pointer' }} />
                </div>
                <iframe
                  style={{ width: '100%', height: '100%', backgroundColor: '', color: 'black', borderColor: 'white', outline: 'none', resize: 'none' }}
                  className="w-full h-full"
                  srcDoc={srcCode}
                  title="output"
                  sandbox="allow-scripts allow-same-origin"
                  width="100%"
                  height="100%"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
        <Modal show={showAlert} onHide={handleCloseAlert} size='lg' aria-labelledby="contained-modal-title-vcenter" centered>
          <Modal.Body className='text-dark w-100 '>
            {displ === 'image' ? (
              <img
                src={questionData?.Sample_img}
                className="img-fluid mt-3"
                alt="image"
                style={{ pointerEvents: 'none', maxWidth: '100%', maxHeight: '100%' }}
              />
            ) : displ === 'output' ? (
              <iframe
                style={{ width: '100%', height: '95%', backgroundColor: '', color: 'black', borderColor: 'white', outline: 'none', resize: 'none' }}
                className="w-full h-full"
                srcDoc={srcCode}
                title="output"
                sandbox="allow-scripts allow-same-origin"
                width="100%"
                height="100%"
              ></iframe>
            ) : null}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="dark" onClick={handleCloseAlert}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Submission</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Do you want to submit both HTML and CSS?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmation}>
              Yes
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={showSkipConfirmation} onHide={() => setSkipConfirmation(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Skip Submission</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Do you want to skip both HTML and CSS? You cannot come back
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setSkipConfirmation(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSkipConfirmation}>
              Yes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};
 
export default HTMLCSSEditor;